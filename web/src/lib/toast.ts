import toast from 'react-hot-toast';

// Custom toast functions with your app's styling
export const showToast = {
  success: (message: string) => {
    return toast.success(message, {
      style: {
        background: 'hsl(var(--success))',
        color: 'hsl(var(--success-foreground))',
        border: '1px solid hsl(var(--success-border))',
      },
    });
  },
  
  error: (message: string) => {
    return toast.error(message, {
      style: {
        background: 'hsl(var(--destructive))',
        color: 'hsl(var(--destructive-foreground))',
        border: '1px solid hsl(var(--border))',
      },
    });
  },
  
  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: 'hsl(var(--muted))',
        color: 'hsl(var(--muted-foreground))',
        border: '1px solid hsl(var(--border))',
      },
    });
  },
  
  custom: (message: string) => {
    return toast(message, {
      style: {
        background: 'hsl(var(--card))',
        color: 'hsl(var(--card-foreground))',
        border: '1px solid hsl(var(--border))',
      },
    });
  },
  
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, messages, {
      style: {
        background: 'hsl(var(--card))',
        color: 'hsl(var(--card-foreground))',
        border: '1px solid hsl(var(--border))',
      },
      success: {
        style: {
          background: 'hsl(var(--success))',
          color: 'hsl(var(--success-foreground))',
        },
      },
      error: {
        style: {
          background: 'hsl(var(--destructive))',
          color: 'hsl(var(--destructive-foreground))',
        },
      },
    });
  },
};

// Re-export the original toast for advanced usage
export { toast };