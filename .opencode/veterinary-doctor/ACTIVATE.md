# Veterinary Doctor Agent - Activation Guide

## Quick Start

### Option 1: Use the CLI Agent

```bash
# Review the current project plan
cd .opencode/veterinary-doctor
node agent.js review-plan

# List top priorities
node agent.js list-priorities
```

### Option 2: Use via Claude Code

When you want Dr. Mitchell's perspective, just ask:

```
"Dr. Mitchell, can you review the patient timeline feature?"

"Dr. Mitchell, what should we prioritize next?"

"From a clinical perspective, is the appointment workflow efficient?"
```

Claude will:
1. Read the persona from `PERSONA.md`
2. Check the current project plan
3. Review relevant code
4. Respond as Dr. Mitchell would
5. Update `improvements.md` if new suggestions arise

## Files Overview

| File | Purpose |
|------|---------|
| `PERSONA.md` | Dr. Mitchell's background, values, and perspective |
| `improvements.md` | Living document of suggested improvements |
| `WORKFLOWS.md` | Reference for common veterinary workflows |
| `agent.js` | CLI tool for quick reviews |
| `README.md` | This file - how to use the agent |

## Example Interactions

### Reviewing a Feature

**You:** "Dr. Mitchell, what do you think of the calendar view?"

**Dr. Mitchell:** "I love the day/week toggle - that's exactly what I need. But I'd really like an 'In Progress' status. When I'm running behind, front desk needs to know which patients are still in rooms vs. which are waiting. Right now I only see scheduled/completed/cancelled."

### Prioritizing Features

**You:** "We can build 2 more features this month. What should they be?"

**Dr. Mitchell:** "Safety first: Patient alert banner for allergies is non-negotiable. After that, vaccination status indicators - I need to see at a glance if vaccines are due during a wellness exam. These two features would save me the most time and prevent mistakes."

### Workflow Review

**You:** "Is the current patient intake workflow efficient?"

**Dr. Mitchell:** "It's good, but I'm worried about missing critical info. When I open a patient record, I should immediately see red alerts for drug allergies or chronic conditions. Don't bury that in the timeline - put it in a banner at the top. I've seen too many close calls when vets miss allergy info."

## Adding New Suggestions

When Dr. Mitchell (via Claude) suggests something new:

1. Claude will automatically format it
2. Add it to `improvements.md` under the appropriate priority
3. Include clinical justification
4. Tag with relevant category

## Integration with Project Management

The agent reads from:
- `.opencode/project-manager/latest-project-plan.md` - Current status
- `CLAUDE.md` - Architecture overview
- Source code - Current implementations

And writes to:
- `.opencode/veterinary-doctor/improvements.md` - Suggestions

This keeps domain expertise separate but connected to the technical planning.

## Tips for Best Results

1. **Be specific** - "Review the patient page" is better than "What do you think?"
2. **Ask about workflows** - Dr. Mitchell excels at clinical workflow analysis
3. **Prioritize** - Ask "What would you build first?" to get ranked priorities
4. **Safety focus** - Always ask "Is this safe?" for patient-facing features
5. **Real-world constraints** - Mention if something is complex to build; Dr. Mitchell understands trade-offs

## Updating the Persona

If you work with real veterinarians and want to refine the persona:

1. Update `PERSONA.md` with their specific feedback
2. Add new workflows to `WORKFLOWS.md`
3. The agent will automatically use the updated persona

---

*This agent represents domain expertise to help build a truly useful veterinary platform.*
