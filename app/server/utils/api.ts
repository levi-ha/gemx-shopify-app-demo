import { json } from '@remix-run/react';

export const responseError = <T>({
  message,
  details,
  status = 500,
}: {
  message: T | string;
  details?: any;
  status?: number;
}) => {
  return json(
    { errors: message, ...(details ? { details } : {}) },
    {
      headers: {
        'Content-Type': 'application/json',
      },
      status,
    },
  );
};

export const responseSuccess = (data: any, init?: ResponseInit) => {
  return json(data, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...init,
  });
};
