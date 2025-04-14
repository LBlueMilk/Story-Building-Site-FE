import { toast } from 'sonner';

export const toastSuccess = (title: string, description?: string) =>
  toast(
    <div>
      <p className="font-semibold text-green-600 text-center">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );

export const toastError = (title: string, description?: string) =>
  toast(
    <div>
      <p className="font-semibold text-red-500 text-center">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
