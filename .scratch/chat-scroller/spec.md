# Chat Scroller — one scroller per chat surface, and shorter nav buttons

## Problem Statement

Scrolling on `/chat` is broken.

On a fresh chat, the welcome screen (the value-prop header, prompt buttons, chat
options toggle, active Filters, and Taste Profile summary) is taller than the
space it is given on a phone. Its container has a fixed height and no overflow
of its own, so the content spills out of the box: the bottom of it slides
underneath the message composer and off the screen, where the user cannot reach
it. The Taste Profile quiz prompt and the sign-in affordance at the very bottom
of the welcome screen are effectively unreachable on a short viewport.

Once a chat has Messages the surface behaves differently again — a second,
inner scroller takes over. So the same route scrolls two different ways
depending on whether the Chat has Messages yet, and the scroll position, the
scrollbar's location, and whether the scroll-to-bottom button exists all change
underneath the user as soon as they send their first Message.

Separately, while the assistant is streaming a reply, a user who scrolls up to
re-read an earlier Message gets yanked back to the bottom. The follow-the-stream
logic reacts to every DOM mutation and decides whether to follow using a flag
that lags a frame or more behind the user's actual scroll, so it overrules them.

The same welcome-screen overflow reproduces in the chat drawer used on the
Recipe detail, Grocery List and Pantry pages, where it is worse: that surface
sits in a portal with no outer scroller to absorb the spill at all.

Unrelated to scrolling, the bottom navigation buttons are too tall. They carry
more vertical padding than they need, which costs roughly a dozen pixels of
content height on exactly the small viewports where the scrolling problem bites
hardest.

## Solution

Every chat surface gets exactly one scroller, and it is the same one in every
state. Whether the Chat is brand new or holds a hundred Messages, whether it is
the full `/chat` route or the drawer, the content scrolls in one place, the
composer stays pinned below it, and the scroll-to-bottom button appears in the
same spot. The bottom of the welcome screen is always reachable.

Following a streaming reply becomes something the user is in charge of. While
they are at the bottom, new content keeps the view pinned to the bottom. The
moment they scroll up, following stops and stays stopped — nothing drags them
back down. Scrolling back to the bottom themselves, or pressing the
scroll-to-bottom button, resumes following.

The bottom navigation buttons and the sidebar navigation buttons get shorter,
returning that vertical space to the content.

## User Stories

1. As a signed-in user opening a fresh Chat on my phone, I want to scroll the
   welcome screen all the way to its end, so that I can reach the Taste Profile
   prompt and the Filters that sit below the fold.
2. As a signed-in user on a fresh Chat, I want the message composer to stay
   pinned at the bottom while I scroll the welcome screen behind it, so that I
   can start typing at any point without scrolling back.
3. As a signed-in user on a short viewport, I want no part of the welcome screen
   to be permanently hidden behind the composer, so that every control I am
   shown is one I can actually press.
4. As a signed-in user, I want scrolling to feel identical before and after I
   send my first Message, so that the surface does not change character under me
   mid-task.
5. As a signed-in user who has just sent a first Message, I want my scroll
   position to land somewhere sensible rather than wherever the previous
   scroller happened to be, so that I see the reply rather than an arbitrary
   offset.
6. As a signed-in user reading a long Chat, I want to scroll back through
   earlier Messages smoothly, so that I can re-read what the assistant proposed.
7. As a signed-in user scrolled up in a long Chat, I want the scroll-to-bottom
   button to appear, so that I have a one-tap way back to the newest Message.
8. As a signed-in user at the bottom of a Chat, I want the scroll-to-bottom
   button to be hidden, so that it does not cover content it cannot usefully act
   on.
9. As a signed-in user who presses the scroll-to-bottom button, I want the view
   to travel to the newest Message and resume following the stream, so that one
   press fully re-attaches me to the conversation.
10. As a signed-in user watching the assistant stream a reply while I am at the
    bottom, I want the view to keep pace with the incoming text, so that I read
    it as it arrives without touching the screen.
11. As a signed-in user who scrolls up mid-stream, I want to stay exactly where
    I put myself, so that I can re-read an earlier Message without being dragged
    back to the bottom.
12. As a signed-in user who scrolled up mid-stream and then scrolled back down
    to the bottom myself, I want following to resume, so that I do not have to
    press a button to re-attach.
13. As a signed-in user, I want a Recipe Option card expanding or collapsing
    mid-Chat not to jerk my scroll position, so that opening a Recipe Option is
    safe wherever I am in the conversation.
14. As a signed-in user opening the chat drawer from a Recipe detail page, I
    want the same single-scroller behavior as the `/chat` route, so that the
    drawer's welcome screen is fully reachable too.
15. As a signed-in user opening the chat drawer from the Grocery List or Pantry,
    I want its welcome screen to scroll within the drawer, so that the drawer's
    own content never spills behind its composer.
16. As a signed-in user scrolling inside the chat drawer, I want the page behind
    the drawer to stay put, so that reaching the end of the Chat does not start
    scrolling the page underneath.
17. As a signed-in user on a tablet or desktop, I want the same scrolling
    behavior as on my phone, so that the surface is predictable across my
    devices.
18. As a signed-out visitor landing on a chat surface, I want the sign-up and
    sign-in affordances at the bottom of the welcome screen to be reachable, so
    that I can actually create an account from there.
19. As a signed-in user, I want the bottom navigation buttons to be shorter, so
    that more of the screen is given to the Chat and less to chrome.
20. As a signed-in user, I want the sidebar navigation buttons to be
    proportionally shorter too, so that the two navigation surfaces stay visually
    consistent.
21. As a signed-in user, I want the shortened navigation buttons to remain
    comfortably tappable, so that the density gain does not cost me accuracy.
22. As a signed-in user, I want the current section to stay visibly marked in
    both navigation surfaces after the height change, so that I never lose track
    of where I am.
23. As a screen-reader user, I want the navigation buttons to keep their labels
    and current-page marking, so that the visual change does not alter what is
    announced.
24. As a keyboard user, I want the chat scroller to be reachable and scrollable
    by keyboard, so that I am not dependent on a pointer to read a long Chat.
25. As a developer, I want the follow-the-stream decision to live in one plain,
    directly testable module, so that a regression in it is caught by a fast test
    rather than only in a browser.
26. As a developer, I want one chat scroller shared by the route and the drawer,
    so that a fix to one is a fix to both and the two cannot drift apart again.

## Implementation Decisions

### One scroller, owned by the chat surface

- Both branches of the chat Interface — the welcome branch and the Messages
  branch — render inside the scroller. Today only the Messages branch does,
  which is the root cause: the welcome branch has no scroller and its overflow
  escapes a fixed-height ancestor.
- The wrapper that currently sits between the chat surface and the Interface (in
  both the `/chat` route component and the chat drawer) keeps its
  height-constraining role but must not itself become a second scroller. The
  existing comments on both wrappers describing why they carry no overflow are
  now half-true and get corrected to describe the unified arrangement.
- The root layout's `main` element stays scrollable for every other route. The
  chat subtree is sized to exactly fill it, so `main` has no overflow to compete
  for while a chat surface is mounted. This relationship is load-bearing and
  gets a comment saying so.
- Two classes inside the Interface are inert and misleading and come out: a
  `flex`/`flex-1`/`flex-col` group applied to a child of a block-level scroller
  (nothing consumes it), and a full-height wrapper around the Messages list that
  caps the background paint at one viewport height while the content scrolls
  past it.

### Follow-the-stream becomes an explicit state machine

The scroll-following policy is extracted from the provider component into a
plain, framework-free module with no DOM dependency, so it can be tested
directly against a fake scroll element rather than through a layout engine. This
is the seam.

The module owns two states and the transitions between them. Shape, from
sketching the transitions (decision-rich parts only):

```ts
type FollowState = 'following' | 'detached'

type ScrollEvent =
  | { type: 'scrolled'; atBottom: boolean }
  | { type: 'contentResized' }
  | { type: 'jumpToBottomRequested' }

// following  + scrolled(atBottom: false)   -> detached      (user took over)
// detached   + scrolled(atBottom: true)    -> following     (user came back)
// *          + jumpToBottomRequested       -> following     (+ scroll to bottom)
// following  + contentResized              -> following     (+ scroll to bottom)
// detached   + contentResized              -> detached      (no effect)
```

- `atBottom` is computed from the element's scroll metrics against a small
  tolerance, not from an intersection observation. A tolerance is required
  because fractional device pixel ratios mean the exact-equality case never
  reliably fires.
- The button's visibility is driven by `atBottom` directly, not by the follow
  state, so it disappears the instant the user reaches the bottom rather than
  waiting for a state transition.

### The observer wiring changes

- `IntersectionObserver` (via `react-intersection-observer`) is dropped from
  this component entirely, along with its sentinel element. It was the source of
  two defects: it was never scoped to the chat scroller as its root, so it
  measured against the browser viewport; and its callback is asynchronous, so
  the flag derived from it lagged the user's real scroll position and let the
  auto-scroll overrule them. A `scroll` listener on the container is synchronous
  and answers the question directly. The library stays in use elsewhere in the
  app for infinite recipe loading and is not removed as a dependency.
- `MutationObserver` is replaced by `ResizeObserver` on the content wrapper.
  Content growth is a size change; the current code fires on every childList and
  characterData mutation in the subtree, which includes route-transition and
  message-entrance animation churn that has nothing to do with new content
  arriving.
- Per the third-party encapsulation standard, `ResizeObserver` is wrapped where
  it is used rather than passed through, since the wrapper adds the tolerance
  handling and the state machine dispatch. It is not promoted to a shared hook
  unless a second surface needs it.

### Module placement

- The state machine is genuinely reused — the `/chat` route and the chat drawer
  both mount the same Interface, and the drawer has the same defect — so it
  earns its own file beside the provider, per the colocation standard's
  "only extract to a separate file when reused" rule. It is exported for its
  colocated test.
- The React provider keeps the DOM wiring (refs, listeners, the context value)
  and delegates every decision to the module. The provider should end up
  materially smaller than it is today.

### Navigation button density

- The bottom navigation tab buttons drop one height step, and the row's own
  vertical padding drops with them, for a combined saving of roughly a dozen
  pixels of bar height.
- The sidebar navigation buttons drop one height step to stay proportional.
- Both keep their existing icon size, label, `aria-current` marking, and active
  plate styling. Nothing about the accessible name or the current-page
  announcement changes.
- The resulting tap targets stay at or above the platform minimum; this is a
  padding trim, not a switch to a compact control.

## Testing Decisions

A good test here asserts external behavior: given a user action, what does the
surface do? It does not assert that a particular observer was constructed, that
a particular effect ran, or how many times a callback fired. The state machine
is tested through its public transitions and effects, not its internals.

### The state machine (primary seam)

- Tested directly as a plain module against a fake scroll element — an object
  exposing scroll metrics — so no layout engine is required and the tests are
  fast and deterministic. This is the whole reason for the extraction: jsdom has
  no layout, so `scrollHeight` and `clientHeight` are zero and any test that
  drives the real component would be asserting against stubs.
- Cases to cover: at-bottom detection within tolerance and just outside it;
  scrolling up detaches; scrolling back to bottom re-attaches; a jump request
  re-attaches from either state; content growth scrolls to bottom only while
  following; content growth while detached is inert.
- Colocated beside the module, no `__tests__` directory, per the TypeScript
  style standard.

### Navigation button height (existing seam)

- The existing app header and sidebar nav jsdom tests are extended to pin the
  height class on the rendered button, alongside the assertions they already
  make about the active plate.
- Prior art is direct: those files already pin the active plate class because a
  styling regression that read as unstyled came back once. The same reasoning
  applies to a padding value that a future className edit could silently
  restore.
- Their existing assertions about `aria-current`, labels and the active plate
  must continue to pass unchanged — that is the guard on story 22 and 23.

### What is not separately tested

- No new end-to-end spec. The scroll policy is covered by the module tests, and
  the layout arrangement is a small, reviewable set of class changes. The
  project does have prior art for browser-level layout assertions — the pantry
  chat FAB spec asserts on real bounding boxes at a mobile viewport — and that
  remains the pattern to reach for if the arrangement proves fragile in review
  or a regression escapes.
- Manual verification at a narrow viewport covers the arrangement: both chat
  states on `/chat`, both in the drawer, signed in and signed out.

## Out of Scope

- Redesigning the welcome screen itself, or reducing how much it renders. It
  stays as tall as it is; the fix is that it scrolls.
- The route transition's transform and the documented sticky-chrome shift it
  causes during the enter animation. It is a known, commented tradeoff and is
  not implicated in the scrolling failure.
- The FAB stack's bottom offsets and its route-entrance delay.
- The other scrollable surfaces in the app — Recipes, Grocery List, Pantry,
  Chat History — which scroll via the layout's `main` and are not changed.
- Removing `react-intersection-observer` as a dependency; infinite recipe
  loading still uses it.
- Any change to the header, footer or navigation beyond the two height values,
  including the sidebar-versus-bottom-bar breakpoint rules.
- Scroll position restoration across navigations, and anchoring the view to a
  specific Message.

## Further Notes

- The bug was introduced in two steps, both of which were correct in isolation.
  Removing the overflow from the chat wrapper fixed a genuine double-scrollbar,
  but only the Messages branch had a replacement scroller, so the welcome branch
  was left with none. The unification is what makes both fixes hold at once.
- The chat drawer carries a comment pointing at the `/chat` route component as
  the explanation for its wrapper. Whatever the route component's comment ends
  up saying, the drawer's must stay accurate — they are a matched pair and are
  easy to let drift.
- The follow-the-stream defect is independent of the layout defect. Either could
  be fixed without the other; they are bundled because they are the same
  component and the extraction that makes one testable is the one that clarifies
  the other.
- The `atBottom` tolerance is the one number in the state machine likely to need
  tuning against a real device. Keep it a named constant with a comment
  explaining the fractional-pixel reason, so it is adjustable without archaeology.
