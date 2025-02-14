import React, { useCallback } from "react";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { GoalForm, GoalSchema } from "@/models/forms/GoalForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoalType } from "@/models/enums/GoalType";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { DatePicker } from "@/components/DatetimePicker";

type CreateGoalModalProps = {
    onCreateGoal: (data: GoalForm) => void;
}

const CreateGoalModal = (props: CreateGoalModalProps) => {
    const {onCreateGoal} = props;


    const form = useForm<GoalForm>({
        resolver: zodResolver(GoalSchema),
        defaultValues: {
            endDate: new Date(),
            startDate: new Date(),
            goalType: GoalType.ONE_TIME,
            name: "",
            description: ""
        }
    });

    const onSubmit = useCallback((formData: GoalForm) => {
        onCreateGoal(formData);
    }, [onCreateGoal]);

    const goalType = form.watch("goalType");

    return (
        <TooltipProvider>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a goal</DialogTitle>
                    <DialogDescription>
                        Create either a daily, weekly or a one time goal.
                    </DialogDescription>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Name of the goal" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            This is the name of your goal
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Describe your goal in short" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            This is the description of your goal
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="goalType"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Goal Type</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-col space-y-1"
                                            >
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value={GoalType.ONE_TIME} />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        One time goal
                                                    </FormLabel>
                                                    <Tooltip>
                                                        <TooltipTrigger type="button" onClick={e => e.preventDefault()}><Info size={18} /></TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Goal not repeated</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value={GoalType.WEEKLY} />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        Weekly goal
                                                    </FormLabel>
                                                    <Tooltip>
                                                        <TooltipTrigger type="button" onClick={e => e.preventDefault()}><Info size={18} /></TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>
                                                                Repeated every 7 days starting from "Start date" until
                                                                "End
                                                                date"
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value={GoalType.DAILY} />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        Daily goal
                                                    </FormLabel>
                                                    <Tooltip>
                                                        <TooltipTrigger type="button" onClick={e => e.preventDefault()}><Info size={18} /></TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Repeated every day starting from "Start date" until "End
                                                                date"</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                disabled={false}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Start Date</FormLabel>
                                        <FormControl>
                                            <DatePicker {...field} onChange={(date) => {
                                                field.onChange(date);
                                                if (goalType === GoalType.ONE_TIME && date) {
                                                    form.setValue("endDate", date);
                                                }
                                            }} />
                                        </FormControl>
                                        <FormDescription>
                                            Date from when the goal will start
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                disabled={goalType === GoalType.ONE_TIME}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>End Date</FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                {...field}
                                                disabledMatcher={form.watch("startDate") ? { before: form.watch("startDate") } : undefined}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Date until when the goal will end
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Submit</Button>
                        </form>
                    </Form>
                </DialogHeader>
            </DialogContent>
        </TooltipProvider>
    );
};

export default CreateGoalModal;
