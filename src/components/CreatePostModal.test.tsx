import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CreatePostModal from './CreatePostModal';
import { BrowserRouter } from 'react-router-dom';

// Mock the store to provide a currentUser so the modal renders the form instead of login prompt
vi.mock('@/lib/store', () => ({
  useApp: () => ({
    state: {
      currentUser: { id: 'user1', name: 'Test User' },
    },
    dispatch: vi.fn(),
  }),
  createPostDraft: vi.fn(),
}));

describe('CreatePostModal', () => {
  it('renders the Application Deadline field with a min attribute', () => {
    const { container } = render(
      <BrowserRouter>
        <CreatePostModal open={true} onClose={() => {}} />
      </BrowserRouter>
    );

    // Find the input with type="date"
    const input = container.querySelector('input[type="date"]');
    expect(input).toBeInTheDocument();
    
    // Check if the min attribute is set to today's date
    const today = new Date().toISOString().split('T')[0];
    expect(input).toHaveAttribute('min', today);
  });
});
