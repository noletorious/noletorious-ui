import type { Meta, StoryObj } from '@storybook/react'

// Pairs of [background token, foreground token] shown as swatches.
// The numeric checks live in `npm run contrast`. This story is for looking at them.
const PAIRS: Array<[string, string]> = [
  ['background', 'foreground'],
  ['card', 'card-foreground'],
  ['popover', 'popover-foreground'],
  ['primary', 'primary-foreground'],
  ['secondary', 'secondary-foreground'],
  ['muted', 'muted-foreground'],
  ['accent', 'accent-foreground'],
  ['destructive', 'destructive-foreground'],
]

function Swatches() {
  return (
    <div className="grid w-[640px] max-w-full grid-cols-2 gap-3 sm:grid-cols-4">
      {PAIRS.map(([bg, fg]) => (
        <div
          key={bg}
          className="flex h-24 flex-col justify-between rounded-md border border-border p-3 text-sm"
          style={{ backgroundColor: `var(--color-${bg})`, color: `var(--color-${fg})` }}
        >
          <span className="font-medium">{bg}</span>
          <span className="opacity-90">on {fg}</span>
        </div>
      ))}
      <div className="col-span-2 flex h-24 items-center gap-3 rounded-md border border-border bg-card p-3 text-sm text-card-foreground sm:col-span-4">
        <input
          readOnly
          value="Input border (3:1 needed)"
          className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-foreground"
        />
        <span className="rounded-md px-3 py-2 ring-2 ring-ring">Focus ring</span>
      </div>
    </div>
  )
}

const meta = {
  title: 'Foundations/Colors',
  component: Swatches,
} satisfies Meta<typeof Swatches>

export default meta
type Story = StoryObj<typeof meta>

export const Tokens: Story = {}
