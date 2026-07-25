'use client';

import { FormEvent, useState, useRef } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface RFQFormProps {
  onSuccess?: () => void;
}

interface FormData {
  company: string;
  contact_name: string;
  phone: string;
  email: string;
  comment: string;
}

interface FormErrors {
  company?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  comment?: string;
}

export default function RFQForm({ onSuccess }: RFQFormProps) {
  const [form, setForm] = useState<FormData>({
    company: '',
    contact_name: '',
    phone: '',
    email: '',
    comment: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function validate(): boolean {
    const errs: FormErrors = {};

    if (!form.phone.trim()) {
      errs.phone = 'Телефон обязателен';
    } else if (!/^\+?\d{7,15}$/.test(form.phone.replace(/[\s\-()]/g, ''))) {
      errs.phone = 'Неверный формат телефона';
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Неверный формат email';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setResult(null);

    try {
      const body = new FormData();
      body.append('company', form.company);
      body.append('contact_name', form.contact_name);
      body.append('phone', form.phone);
      body.append('email', form.email);
      body.append('comment', form.comment);
      if (file) body.append('file', file);

      const res = await fetch('/api/quote', { method: 'POST', body });

      if (!res.ok) throw new Error('Server error');

      setResult('success');
      setForm({ company: '', contact_name: '', phone: '', email: '', comment: '' });
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      onSuccess?.();
    } catch {
      setResult('error');
    } finally {
      setSubmitting(false);
    }
  }

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Компания"
        value={form.company}
        onChange={(e) => update('company', e.target.value)}
      />
      <Input
        label="Контактное лицо"
        value={form.contact_name}
        onChange={(e) => update('contact_name', e.target.value)}
      />
      <Input
        label="Телефон"
        required
        value={form.phone}
        onChange={(e) => update('phone', e.target.value)}
        error={errors.phone}
        placeholder="+7 (___) ___-__-__"
      />
      <Input
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => update('email', e.target.value)}
        error={errors.email}
      />
      <div className="space-y-1">
        <label className="block text-sm font-medium text-text">Комментарий</label>
        <textarea
          value={form.comment}
          onChange={(e) => update('comment', e.target.value)}
          rows={4}
          className="w-full rounded-input border border-gray-300 bg-surface px-3 py-2.5 text-sm text-text placeholder:text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-steel"
          placeholder="Укажите артикулы и количество"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-text">Прикрепить спецификацию</label>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.zip"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-muted file:mr-4 file:rounded-btn file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
        />
      </div>

      <Button type="submit" loading={submitting} className="w-full">
        Отправить запрос
      </Button>

      {result === 'success' && (
        <p className="rounded-md bg-green-50 p-3 text-sm text-green-800">
          Запрос отправлен. Мы свяжемся с вами в ближайшее время.
        </p>
      )}
      {result === 'error' && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          Ошибка отправки. Попробуйте позже или позвоните нам.
        </p>
      )}
    </form>
  );
}
