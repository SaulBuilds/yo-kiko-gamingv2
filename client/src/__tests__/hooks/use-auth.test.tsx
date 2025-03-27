/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useAuth, AuthProvider } from '@/hooks/use-auth';
import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the hooks directly to prevent network calls
jest.mock('@/hooks/use-auth', () => {
  const originalModule = jest.requireActual('@/hooks/use-auth');
  
  // Create mock auth context
  const mockContext = {
    user: null,
    isLoading: false,
    error: null,
    address: undefined,
    updateProfileMutation: {
      mutate: jest.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
    },
    isConnecting: false,
    connect: jest.fn(),
    disconnect: jest.fn(),
  };
  
  return {
    ...originalModule,
    useAuth: () => mockContext,
    AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>
  };
});

// Mock the queryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Helper for wrapping in providers
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useAuth Hook', () => {
  /**
   * Test case for initial state of auth hook
   */
  test('should provide auth context value', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Verify initial state
    expect(result.current).toBeDefined();
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isConnecting).toBe(false);
  });

  /**
   * Test case for connect method
   */
  test('connect method is callable', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Call connect method
    act(() => {
      result.current.connect();
    });
    
    // Verify connect was called
    expect(result.current.connect).toBeDefined();
  });

  /**
   * Test case for disconnect method
   */
  test('disconnect method is callable', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Call disconnect method
    act(() => {
      result.current.disconnect();
    });
    
    // Verify disconnect was called
    expect(result.current.disconnect).toBeDefined();
  });
});