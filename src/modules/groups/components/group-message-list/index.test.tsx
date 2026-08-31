import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { GroupAuthorKind, GroupMessage } from '@/modules/core/types/groups'
import { GroupMessageList } from '.'

const entry = (
  id: string,
  kind: GroupAuthorKind,
  name: string,
  text: string,
): GroupMessage => ({
  id,
  at: 1_700_000_000_000,
  from: { kind, name },
  text,
  thread: 'main',
})

describe('GroupMessageList', () => {
  it('names every member so a six-way room stays attributable', () => {
    render(
      <GroupMessageList
        viewer="You"
        membersTyping={[]}
        messages={[
          entry('1', 'user', 'You', 'Where are we on the launch?'),
          entry('2', 'member', 'ada', 'Copy is signed off.'),
          entry('3', 'member', 'grace', 'Then I can ship on Friday.'),
        ]}
      />,
    )

    expect(screen.getByRole('log', { name: 'Room transcript' })).toBeInTheDocument()
    expect(screen.getByText('Where are we on the launch?')).toBeInTheDocument()
    expect(screen.getByText('ada')).toBeInTheDocument()
    expect(screen.getByText('Copy is signed off.')).toBeInTheDocument()
    expect(screen.getByText('grace')).toBeInTheDocument()
    expect(screen.getByText('Then I can ship on Friday.')).toBeInTheDocument()
  })

  it('says who is typing right now', () => {
    render(<GroupMessageList viewer="You" membersTyping={['ada', 'grace']} messages={[]} />)

    expect(screen.getByText('ada is typing…')).toBeInTheDocument()
    expect(screen.getByText('grace is typing…')).toBeInTheDocument()
  })

  /*
   * The empty room is the *page's* state, not the list's — §1d wants the members
   * named and a prompt for the first message, which needs the room, so the list
   * renders nothing and `GroupRoomView` owns it.
   */
  it('renders nothing for a room nobody has used', () => {
    render(<GroupMessageList viewer="You" membersTyping={[]} messages={[]} />)

    expect(screen.queryByText(/nobody has spoken/i)).not.toBeInTheDocument()
  })
})
