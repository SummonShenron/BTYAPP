# Madison Admin Scheduling Guide

## Purpose

The admin schedule editor lets Madison define recurring weekly availability that powers the public booking page.

## How It Works

1. Open `/admin`.
2. In the dashboard, use the recurring schedule section.
3. Click a weekday tile to edit that day.
4. Add one or more recurring time blocks for that weekday.
5. Optionally add a client name label to a block for clearer tracking.
6. Save the schedule.

## Important Settings

- Timezone controls which local time the weekly schedule uses.
- Booking window controls how many days ahead clients can book.
- Slot length controls the size of each generated public slot.

## Notes for the Assistant

- Recurring blocks are weekly templates, not one-off dated events.
- The public booking page generates future slots from these rules.
- If a slot is already booked, it should not appear as open.
- If Madison asks where to edit availability, direct her to the calendar-style schedule editor inside `/admin`.
