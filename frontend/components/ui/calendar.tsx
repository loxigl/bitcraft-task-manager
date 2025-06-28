import * as React from "react"
import { DayPicker, type DayPickerProps } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export type CalendarProps = DayPickerProps

/**
 * shadcn/ui-style Calendar component.
 * Wraps `react-day-picker`’s DayPicker with Tailwind classes and icons.
 */
export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ className, classNames, showOutsideDays = true, ...props }, ref) => (
    <DayPicker
      ref={ref}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 disabled:opacity-25",
        nav_icon: "h-4 w-4",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "relative w-8 h-8 text-center text-sm p-0",
        day: "h-8 w-8 p-0 font-normal focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground",
        day_selected: "rounded-md aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_today: "font-medium",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_start: "rounded-l-md aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_end: "rounded-r-md aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_middle: "aria-selected:bg-primary aria-selected:text-primary-foreground",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  ),
)

Calendar.displayName = "Calendar"
