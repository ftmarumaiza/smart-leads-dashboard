import React, { useState } from 'react';
import { Lead, LeadFormData, LeadStatus, LeadSource } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { STATUSES, SOURCES } from '../../utils';

interface LeadFormProps {
  initialData?: Lead;
  onSubmit: (data: LeadFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  source?: string;
}

export const LeadForm: React.FC<LeadFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [form, setForm] = useState<LeadFormData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    status: initialData?.status || 'New',
    source: initialData?.source || 'Website',
    notes: initialData?.notes || '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim() || form.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!form.source) {
      newErrors.source = 'Source is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  const set = (field: keyof LeadFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          value={form.name}
          onChange={set('name')}
          error={errors.name}
          placeholder="John Doe"
        />
        <Input
          label="Email Address"
          type="email"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
          placeholder="john@example.com"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Status"
          value={form.status}
          onChange={set('status')}
          options={STATUSES.map((s) => ({ value: s, label: s }))}
        />
        <Select
          label="Source"
          value={form.source}
          onChange={set('source')}
          error={errors.source}
          options={SOURCES.map((s) => ({ value: s, label: s }))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Notes <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={form.notes}
          onChange={set('notes')}
          rows={3}
          maxLength={500}
          placeholder="Add any additional notes..."
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900
            text-gray-900 dark:text-gray-100 placeholder-gray-400 px-3 py-2.5 text-sm
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
            transition-colors duration-150 resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">{form.notes?.length || 0}/500</p>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Lead' : 'Create Lead'}
        </Button>
      </div>
    </form>
  );
};
