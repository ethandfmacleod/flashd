import { toast } from 'sonner-native'

interface ToastConfig {
  title: string
  description?: string
  duration?: number
}

export const useToastNotifications = () => {
  const showError = ({ title, description, duration = 5000 }: ToastConfig) => {
    toast.error(title, {
      description,
      duration,
    })
  }

  const showSuccess = ({ title, description, duration = 4000 }: ToastConfig) => {
    toast.success(title, {
      description,
      duration,
    })
  }

  const showInfo = ({ title, description, duration = 4000 }: ToastConfig) => {
    toast.info(title, {
      description,
      duration,
    })
  }

  const showWarning = ({ title, description, duration = 4000 }: ToastConfig) => {
    toast.warning(title, {
      description,
      duration,
    })
  }

  const showPromise = <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    toast.promise(promise, {
      loading,
      success,
      error,
    })
  }

  return {
    showError,
    showSuccess,
    showInfo,
    showWarning,
    showPromise,
    // Direct access to toast for more advanced usage
    toast,
  }
}

// Export individual functions for convenience
export const showError = ({ title, description, duration = 5000 }: ToastConfig) => {
  toast.error(title, {
    description,
    duration,
  })
}

export const showSuccess = ({ title, description, duration = 4000 }: ToastConfig) => {
  toast.success(title, {
    description,
    duration,
  })
}

export const showInfo = ({ title, description, duration = 4000 }: ToastConfig) => {
  toast.info(title, {
    description,
    duration,
  })
}

export const showWarning = ({ title, description, duration = 4000 }: ToastConfig) => {
  toast.warning(title, {
    description,
    duration,
  })
}

// Enhanced toast functions with Sonner's additional features
export const showPromise = <T,>(
  promise: Promise<T>,
  {
    loading,
    success,
    error,
  }: {
    loading: string
    success: string | ((data: T) => string)
    error: string | ((error: any) => string)
  }
) => {
  return toast.promise(promise, {
    loading,
    success: typeof success === 'string' ? () => success : success,
    error: typeof error === 'string' ? () => error : error,
  })
}

// Custom toast with action button
export const showActionToast = ({
  title,
  description,
  actionLabel,
  action,
  duration = 5000,
}: ToastConfig & {
  actionLabel: string
  action: () => void
}) => {
  return toast(title, {
    description,
    duration,
    action: {
      label: actionLabel,
      onClick: action,
    },
  })
}

// Dismissible toast
export const showDismissibleToast = ({ title, description, duration = 0 }: ToastConfig) => {
  return toast(title, {
    description,
    duration, // 0 = never auto-dismiss
    cancel: {
      label: 'Dismiss',
      onClick: () => {}, // Will auto-dismiss when clicked
    },
  })
}