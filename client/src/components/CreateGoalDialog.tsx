import { useState } from "react";
import { useCreateGoal } from "@/hooks/use-goals";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const goalTypes = [
  { value: "counter", label: "Teller (bijv. sport 3x per week)" },
  { value: "progress", label: "Voortgang (bijv. €5000 sparen)" },
  { value: "boolean", label: "Ja/Nee (bijv. mijlpaal bereikt)" },
] as const;

const resetPeriods = [
  { value: "none", label: "Geen reset" },
  { value: "weekly", label: "Wekelijks" },
  { value: "monthly", label: "Maandelijks" },
] as const;

const goalColors = [
  { value: "blue", label: "Blauw" },
  { value: "green", label: "Groen" },
  { value: "red", label: "Rood" },
  { value: "orange", label: "Oranje" },
  { value: "purple", label: "Paars" },
  { value: "pink", label: "Roze" },
  { value: "teal", label: "Teal" },
  { value: "yellow", label: "Geel" },
] as const;

const createGoalSchema = z.object({
  title: z.string().min(1, "Titel is vereist"),
  type: z.enum(["counter", "progress", "boolean"]),
  targetValue: z.coerce.number().optional(),
  unit: z.string().optional(),
  color: z.string().default("blue"),
  resetPeriod: z.enum(["none", "weekly", "monthly"]).default("none"),
});

type CreateGoalValues = z.infer<typeof createGoalSchema>;

interface CreateGoalDialogProps {
  category: string;
}

export function CreateGoalDialog({ category }: CreateGoalDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createGoal = useCreateGoal();

  const form = useForm<CreateGoalValues>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      title: "",
      type: "counter",
      targetValue: undefined,
      unit: "",
      color: "blue",
      resetPeriod: "none",
    },
  });

  const goalType = form.watch("type");

  const onSubmit = (data: CreateGoalValues) => {
    createGoal.mutate({
      title: data.title,
      category,
      type: data.type,
      currentValue: 0,
      targetValue: data.type === "boolean" ? 1 : data.targetValue || null,
      unit: data.unit || null,
      color: data.color,
      resetPeriod: data.resetPeriod,
      periodStartDate: data.resetPeriod !== "none" ? new Date() : null,
    }, {
      onSuccess: () => {
        toast({
          title: "Doel aangemaakt",
          description: `${data.title} is toegevoegd`,
        });
        form.reset();
        setOpen(false);
      },
      onError: () => {
        toast({
          title: "Fout",
          description: "Kon doel niet aanmaken",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" data-testid="button-add-goal">
          <Plus className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nieuw doel toevoegen</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titel</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Bijv. Sport per week" data-testid="input-goal-title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-goal-type">
                        <SelectValue placeholder="Kies een type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {goalTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(goalType === "counter" || goalType === "progress") && (
              <>
                <FormField
                  control={form.control}
                  name="targetValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doelwaarde</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="Bijv. 4" 
                          data-testid="input-goal-target"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eenheid (optioneel)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Bijv. keer, euro, dagen" data-testid="input-goal-unit" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kleur</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-goal-color">
                        <SelectValue placeholder="Kies een kleur" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {goalColors.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          {color.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resetPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reset periode</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-goal-reset">
                        <SelectValue placeholder="Kies reset periode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {resetPeriods.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={createGoal.isPending}
              data-testid="button-submit-goal"
            >
              {createGoal.isPending ? "Aanmaken..." : "Doel toevoegen"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
