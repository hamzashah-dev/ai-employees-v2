/**
 * Mount coverage for the mirrored `@repo/ui` primitives — an addition, not a copy of
 * anything upstream (see README). It exists to catch an `rsync` refresh that silently
 * changes the API this app leans on.
 *
 * The variant names are asserted by the *typecheck*, not by a class-name match: `variant`
 * is a union derived from the cva config, so `variant="secondary"` below stops compiling
 * the moment §6's secondary `TabsTrigger` stops shipping. That is a stronger guarantee than
 * grepping a class string, and it survives a re-skin.
 */
import { render, screen } from '@testing-library/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs'
import {
  SegmentedControls,
  SegmentedControlsList,
  SegmentedControlsTrigger,
} from '@repo/ui/segmented-controls'
import { Separator } from '@repo/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@repo/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/dropdown-menu'

it('tabs render, and the secondary variant §6 asks for still exists', () => {
  render(
    <Tabs defaultValue="all">
      <TabsList>
        <TabsTrigger value="all" variant="secondary">
          All
        </TabsTrigger>
        <TabsTrigger value="money" variant="secondary">
          Money
        </TabsTrigger>
      </TabsList>
      <TabsContent value="all">Everything</TabsContent>
    </Tabs>,
  )
  expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute(
    'data-state',
    'active',
  )
  expect(screen.getByRole('tab', { name: 'Money' })).toBeInTheDocument()
  expect(screen.getByText('Everything')).toBeInTheDocument()
})

it('segmented controls render D12s four cadences', () => {
  render(
    <SegmentedControls defaultValue="daily">
      <SegmentedControlsList variant="primary">
        {['Daily', 'Weekdays', 'Weekly', 'Custom'].map((label) => (
          <SegmentedControlsTrigger
            key={label}
            value={label.toLowerCase()}
            variant="secondary"
          >
            {label}
          </SegmentedControlsTrigger>
        ))}
      </SegmentedControlsList>
    </SegmentedControls>,
  )
  expect(screen.getAllByRole('tab')).toHaveLength(4)
  expect(screen.getByRole('tab', { name: 'Daily' })).toHaveAttribute(
    'data-state',
    'active',
  )
})

it('separator renders a decorative rule', () => {
  const { container } = render(<Separator />)
  expect(container.firstChild).toHaveAttribute('data-orientation', 'horizontal')
})

it('table renders a routines-overview shaped grid', () => {
  render(
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Cadence</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Sales Outbound</TableCell>
          <TableCell>Weekdays at 6:00 PM</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  )
  expect(
    screen.getByRole('columnheader', { name: 'Employee' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('cell', { name: 'Sales Outbound' }),
  ).toBeInTheDocument()
})

it('dialog renders its content when open', () => {
  render(
    <Dialog open>
      <DialogContent>
        <DialogTitle>Search</DialogTitle>
        <DialogDescription>Employees and messages</DialogDescription>
      </DialogContent>
    </Dialog>,
  )
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByText('Search')).toBeInTheDocument()
})

it('dropdown menu renders its trigger and open content', () => {
  render(
    <DropdownMenu open>
      <DropdownMenuTrigger>Recommended</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>A–Z</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  )
  // Radix marks the trigger aria-hidden while the modal menu is open, so query by text.
  expect(screen.getByText('Recommended')).toBeInTheDocument()
  expect(screen.getByRole('menuitem', { name: 'A–Z' })).toBeInTheDocument()
})
