import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/strapi';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const company = (formData.get('company') as string)?.trim() || '';
    const contact_name = (formData.get('contact_name') as string)?.trim() || '';
    const phone = (formData.get('phone') as string)?.trim() || '';
    const email = (formData.get('email') as string)?.trim() || '';
    const comment = (formData.get('comment') as string)?.trim() || '';
    const file = formData.get('file') as File | null;

    const errors: Record<string, string> = {};

    if (!phone) {
      errors.phone = 'Телефон обязателен';
    } else if (!/^\+?\d{7,15}$/.test(phone.replace(/[\s\-()]/g, ''))) {
      errors.phone = 'Неверный формат телефона';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Неверный формат email';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 422 });
    }

    const orderData = {
      company,
      contact_name,
      phone,
      email: email || undefined,
      items: [],
      comment: comment || undefined,
    };

    await createOrder(orderData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Quote API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при отправке запроса. Попробуйте позже.' },
      { status: 500 }
    );
  }
}
