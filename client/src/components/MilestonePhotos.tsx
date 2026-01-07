import { useState } from "react";
import { useMilestonePhotos, useCreateMilestonePhoto, useDeleteMilestonePhoto } from "@/hooks/use-goals";
import { Camera, X, Plus, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface MilestonePhotosProps {
  goalId: number;
}

const photoFormSchema = z.object({
  imageUrl: z.string().min(1, "URL is vereist").url("Voer een geldige URL in"),
  caption: z.string().optional(),
});

type PhotoFormValues = z.infer<typeof photoFormSchema>;

export function MilestonePhotos({ goalId }: MilestonePhotosProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  
  const { data: photos, isLoading } = useMilestonePhotos(goalId);
  const createPhoto = useCreateMilestonePhoto();
  const deletePhoto = useDeleteMilestonePhoto();

  const form = useForm<PhotoFormValues>({
    resolver: zodResolver(photoFormSchema),
    defaultValues: {
      imageUrl: "",
      caption: "",
    },
  });

  const onSubmit = (data: PhotoFormValues) => {
    createPhoto.mutate({
      goalId,
      userId: 1,
      imageUrl: data.imageUrl,
      caption: data.caption || undefined,
    }, {
      onSuccess: () => {
        form.reset();
        setIsAdding(false);
        toast({
          title: "Foto toegevoegd",
          description: "De foto is succesvol opgeslagen",
        });
      },
      onError: () => {
        toast({
          title: "Fout",
          description: "Kon foto niet toevoegen",
          variant: "destructive",
        });
      }
    });
  };

  const handleDeletePhoto = (photoId: number) => {
    deletePhoto.mutate({ id: photoId, goalId }, {
      onSuccess: () => {
        toast({
          title: "Foto verwijderd",
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6" data-testid="loading-photos">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Camera className="w-4 h-4" />
          <span>Foto's</span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "w-7 h-7",
            isAdding && "text-destructive"
          )}
          data-testid="button-toggle-add-photo"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 p-3 bg-secondary/50 rounded-lg">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Afbeelding URL..."
                          data-testid="input-photo-url"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="caption"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Beschrijving (optioneel)"
                          data-testid="input-photo-caption"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={createPhoto.isPending}
                  className="w-full"
                  data-testid="button-save-photo"
                >
                  {createPhoto.isPending ? "Toevoegen..." : "Foto toevoegen"}
                </Button>
              </form>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>

      {photos && photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group"
              data-testid={`photo-item-${photo.id}`}
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
                <img
                  src={photo.imageUrl}
                  alt={photo.caption || "Mijlpaal foto"}
                  className="w-full h-full object-cover"
                  data-testid={`photo-image-${photo.id}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' fill='%239ca3af' font-size='12'%3EFoto%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
              <Button
                size="icon"
                variant="destructive"
                onClick={() => handleDeletePhoto(photo.id)}
                className={cn(
                  "absolute top-1 right-1 w-6 h-6",
                  "invisible group-hover:visible"
                )}
                data-testid={`button-delete-photo-${photo.id}`}
              >
                <X className="w-3 h-3" />
              </Button>
              {photo.caption && (
                <p className="text-xs text-muted-foreground mt-1 truncate" data-testid={`photo-caption-${photo.id}`}>
                  {photo.caption}
                </p>
              )}
              <p className="text-xs text-muted-foreground/60" data-testid={`photo-date-${photo.id}`}>
                {format(new Date(photo.createdAt || ""), "d MMM yyyy", { locale: nl })}
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground text-sm" data-testid="empty-photos">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
          Nog geen foto's toegevoegd
        </div>
      )}
    </div>
  );
}
