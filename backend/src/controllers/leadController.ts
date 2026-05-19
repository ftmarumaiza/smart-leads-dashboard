import { Request, Response, NextFunction } from 'express';
import Lead from '../models/Lead';
import { ApiResponse, LeadFilters, LeadStatus, LeadSource, PaginationMeta } from '../types';
import { createError } from '../middleware/errorHandler';
import mongoose from 'mongoose';

export const getLeads = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      status,
      source,
      search,
      sort = 'latest',
      page = 1,
      limit = 10,
    } = req.query as unknown as LeadFilters;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filterQuery: mongoose.FilterQuery<typeof Lead> = {};

    if (status) filterQuery.status = status as LeadStatus;
    if (source) filterQuery.source = source as LeadSource;

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filterQuery.$or = [
        { name: searchRegex },
        { email: searchRegex },
      ];
    }

    // Role-based: sales users see only their own leads
    if (req.user?.role === 'sales') {
      filterQuery.createdBy = req.user.userId;
    }

    const sortOrder = sort === 'oldest' ? 1 : -1;

    const [leads, total] = await Promise.all([
      Lead.find(filterQuery)
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Lead.countDocuments(filterQuery),
    ]);

    const totalPages = Math.ceil(total / limitNum);
    const meta: PaginationMeta = {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    };

    const response: ApiResponse<typeof leads> = {
      success: true,
      data: leads,
      meta,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(createError('Invalid lead ID', 400));
      return;
    }

    const lead = await Lead.findById(id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!lead) {
      next(createError('Lead not found', 404));
      return;
    }

    // Sales users can only view their own leads
    if (
      req.user?.role === 'sales' &&
      lead.createdBy._id.toString() !== req.user.userId
    ) {
      next(createError('Access denied', 403));
      return;
    }

    const response: ApiResponse<typeof lead> = {
      success: true,
      data: lead,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const createLead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      next(createError('Not authenticated', 401));
      return;
    }

    const { name, email, status, source, notes, assignedTo } = req.body;

    const lead = await Lead.create({
      name,
      email,
      status,
      source,
      notes,
      assignedTo,
      createdBy: req.user.userId,
    });

    const populatedLead = await Lead.findById(lead._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    const response: ApiResponse<typeof populatedLead> = {
      success: true,
      message: 'Lead created successfully',
      data: populatedLead,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(createError('Invalid lead ID', 400));
      return;
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      next(createError('Lead not found', 404));
      return;
    }

    // Sales users can only update their own leads
    if (
      req.user?.role === 'sales' &&
      lead.createdBy.toString() !== req.user.userId
    ) {
      next(createError('Access denied', 403));
      return;
    }

    const { name, email, status, source, notes, assignedTo } = req.body;

    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      { name, email, status, source, notes, assignedTo },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    const response: ApiResponse<typeof updatedLead> = {
      success: true,
      message: 'Lead updated successfully',
      data: updatedLead,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(createError('Invalid lead ID', 400));
      return;
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      next(createError('Lead not found', 404));
      return;
    }

    // Only admins can delete leads
    if (req.user?.role !== 'admin') {
      next(createError('Only admins can delete leads', 403));
      return;
    }

    await Lead.findByIdAndDelete(id);

    const response: ApiResponse<null> = {
      success: true,
      message: 'Lead deleted successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const exportLeadsCSV = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, source, search } = req.query as {
      status?: LeadStatus;
      source?: LeadSource;
      search?: string;
    };

    const filterQuery: mongoose.FilterQuery<typeof Lead> = {};

    if (status) filterQuery.status = status;
    if (source) filterQuery.source = source;

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filterQuery.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    if (req.user?.role === 'sales') {
      filterQuery.createdBy = req.user.userId;
    }

    const leads = await Lead.find(filterQuery)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Build CSV manually
    const headers = ['Name', 'Email', 'Status', 'Source', 'Notes', 'Created By', 'Created At'];
    const rows = leads.map((lead) => {
      const createdBy = lead.createdBy as unknown as { name: string; email: string } | null;
      return [
        lead.name,
        lead.email,
        lead.status,
        lead.source,
        lead.notes ?? '',
        createdBy ? `${createdBy.name} (${createdBy.email})` : 'Unknown',
        new Date(lead.createdAt).toISOString(),
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

export const getLeadStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filter: mongoose.FilterQuery<typeof Lead> = {};
    if (req.user?.role === 'sales') {
      filter.createdBy = req.user.userId;
    }

    const [statusStats, sourceStats, total] = await Promise.all([
      Lead.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Lead.aggregate([
        { $match: filter },
        { $group: { _id: '$source', count: { $sum: 1 } } },
      ]),
      Lead.countDocuments(filter),
    ]);

    const response: ApiResponse<{
      total: number;
      byStatus: Record<string, number>;
      bySource: Record<string, number>;
    }> = {
      success: true,
      data: {
        total,
        byStatus: statusStats.reduce(
          (acc, s) => ({ ...acc, [s._id]: s.count }),
          {}
        ),
        bySource: sourceStats.reduce(
          (acc, s) => ({ ...acc, [s._id]: s.count }),
          {}
        ),
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
