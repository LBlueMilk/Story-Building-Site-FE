import { toast } from 'sonner';

export const toastSuccess = (title: string, description?: string) =>
  toast.success(
    <div>
      <p className="font-semibold text-green-600 text-center">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>,
    {
      duration: 4000,
    }
  );

export const toastError = (title: string, description?: string, id?: string) =>
  toast.error(
    <div>
      <p className="font-semibold text-red-500 text-center">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>,
    {
      id,
      duration: 4000,
    }
  );

