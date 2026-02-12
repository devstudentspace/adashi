import { toast } from "sonner";

type ToastOptions = {
  title?: string;
  description?: string;
  duration?: number;
};

export const useToast = () => {
  const showToast = (message: string, options?: ToastOptions) => {
    return toast(message, {
      description: options?.description,
      duration: options?.duration || 3000,
    });
  };

  const toastSuccess = (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      description: options?.description,
      duration: options?.duration || 3000,
    });
  };

  const toastError = (message: string, options?: ToastOptions) => {
    return toast.error(message, {
      description: options?.description,
      duration: options?.duration || 3000,
    });
  };

  const toastInfo = (message: string, options?: ToastOptions) => {
    return toast(message, {
      description: options?.description,
      duration: options?.duration || 3000,
    });
  };

  const toastWarning = (message: string, options?: ToastOptions) => {
    return toast.warning(message, {
      description: options?.description,
      duration: options?.duration || 3000,
    });
  };

  return {
    toast: showToast,
    toastSuccess,
    toastError,
    toastInfo,
    toastWarning,
    dismiss: toast.dismiss,
  };
};