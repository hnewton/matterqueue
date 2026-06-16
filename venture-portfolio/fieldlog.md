---
name: Fieldlog
type: workflow
doc_level: capsule
state: parked
focus: false
try_it: false
map_it: false
todoist: false
created_date: 2026-05-10
modified_date: 2026-06-15
uses:
  - Pushwave
synergies:
  - Frostline
  - Driftmap
actions:
  - description: Document the current manual field logging process end to end
    type: task
    state: done
    position: 1
  - description: Identify the three highest-friction steps in the current process
    type: research
    state: open
    position: 2
---

## Idea Capsule — 2026-05-10

**Name** — Fieldlog
**One Phrase** — Shared process for capturing and routing field observations
**Core Sentence** — Fieldlog is the workflow that field teams follow to capture, tag, and route raw observations from the field into the tools that interpret them — a shared primitive that Frostline automates and Driftmap consumes.
**One Paragraph** — Before Frostline can automate field capture, the underlying workflow needs to be understood and documented. Fieldlog is that workflow: the sequence of steps a field team currently follows to capture observations, decide what matters, tag it for routing, and get it into the right downstream tool. Defining this workflow explicitly is the prerequisite for automating it.

**Key Insights**
- You can't automate a workflow you haven't mapped — Fieldlog is the mapping before the automation
- The routing decision (which observation goes to which tool) is where the most friction lives in current practice
- Fieldlog is not a product — it is a shared primitive that Frostline and Driftmap both depend on

**User** — Not user-facing. Defines the process that Frostline automates and Driftmap consumes.

**Model** — No direct model — workflow primitive. Value is realized through the products that automate it.

**Why It's Real**
- Current field teams have this workflow implicitly — it is undocumented and inconsistent
- Documenting it is low-cost; not documenting it means Frostline will automate the wrong thing

**Flags**
- Parked until the Frostline prototype is further along — no point refining the workflow spec until we know what Frostline can actually capture
- Risk of over-specifying the workflow before it has been tested against real field conditions

**Synergy**
- **Frostline** — Frostline automates Fieldlog; the workflow defines what Frostline captures
- **Driftmap** — Driftmap consumes Fieldlog output; the routing step determines what arrives in Driftmap

---

## Action Log

**2026-05-12** — Documented current manual process with one field team. Five steps: observe, note, tag, route, confirm. Routing is the highest-friction step — teams disagree on which tool gets which observation. Tagging is inconsistent. Confirmation is often skipped.

---

## Decision Log

---

## Open Questions Log

**2026-05-10** `open` — Should Fieldlog specify a tagging taxonomy, or leave tagging free-form and let downstream tools filter? Free-form is easier to adopt; taxonomy makes routing reliable.
