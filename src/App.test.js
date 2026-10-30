import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

const unit = { id: 'unit1', name: 'Unit 1', description: '', fileName: 'UNIT1.csv' };
afterEach(() => jest.restoreAllMocks());

test('loads discovered unit and preserves its complete definition in study list', async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [unit] })
    .mockResolvedValueOnce({ ok: true, text: async () => 'Heredity,"Genes, family and traits"' });
  render(<App />);
  fireEvent.click(await screen.findByText('Unit 1'));
  expect(await screen.findByText('1 terms loaded')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Study List'));
  expect(screen.getByText('Genes, family and traits')).toBeInTheDocument();
});

test('shows CSV errors and lets the reader retry without sample cards', async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [unit] })
    .mockResolvedValueOnce({ ok: true, text: async () => 'broken,' })
    .mockResolvedValueOnce({ ok: true, text: async () => 'Actual,Definition' });
  render(<App />);
  fireEvent.click(await screen.findByText('Unit 1'));
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not load Unit 1');
  expect(screen.queryByText(/terms loaded/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('Unit 1'));
  expect(await screen.findByText('1 terms loaded')).toBeInTheDocument();
});

test('shows a manifest error when hosting returns HTML or a missing manifest', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 });
  render(<App />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Unit manifest request failed (HTTP 404)');
});
