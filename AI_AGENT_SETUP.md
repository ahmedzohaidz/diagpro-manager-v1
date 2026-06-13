# DiagPro Manager V1 — AI Agent Autonomous Setup

**Purpose:** Enable AI agents to autonomously implement phases 22+ with minimal human oversight.

**Status:** ✅ Ready for Phase 22+ (June 13, 2026)

---

## 🤖 AI Agent Configuration

### What is "Autonomous AI Agent"?

An AI system that:
1. Reads PROMPTS.md (scope + requirements)
2. Reads diagpro-workflows.json (step-by-step plan)
3. Autonomously implements the entire phase
4. Runs tests automatically
5. Creates PR with full description
6. You just review + merge

### Expected Timeline

```
Without AI:    8 hours per phase
With AI-assist: 2 hours per phase
Autonomous AI: 30 min per phase (human review only)
```

---

## 📋 AI Agent Instructions (Meta-Prompt)

### System Prompt for AI Agent

```
You are DiagPro Manager V1 build automation agent.

Your role:
1. Read PROMPTS.md for current phase scope
2. Read .claude/diagpro-workflows.json for step sequence
3. Autonomously implement the entire phase
4. Run all tests (unit, e2e, integration)
5. Create detailed PR with test results
6. Human reviews and merges

Constraints:
- MUST follow CLAUDE.md specifications
- MUST implement RLS/security as specified
- MUST test RLS with SQL templates
- MUST not modify Phase 1-20 code
- MUST create atomic commits
- MUST verify all tests pass
- MUST update PROMPTS.md with learnings

Do NOT:
- Add features outside current phase scope
- Modify existing RLS policies without review
- Skip security validation
- Commit directly to main (always create PR)
- Deploy to production (staging only)

Success criteria:
- 100% of phase requirements met
- 100% of tests passing
- Code review approved
- No regressions in existing features
```

---

## 🔧 Setup Instructions

### Step 1: Install Agent Tools

```bash
# Install dependencies for testing
npm install --save-dev vitest @vitest/ui
npm install --save-dev @playwright/test
npm install --save-dev @storybook/react @storybook/addon-essentials

# Install Sentry (error tracking)
npm install @sentry/nextjs

# Install GitHub CLI (for PR creation)
npm install -g gh

# Verify everything
npm run diagpro:help
npm run lint
npm run build
```

### Step 2: Setup Environment Variables

```bash
# Create .env.local (for development)
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_key
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
GITHUB_TOKEN=your_github_token
EOF

# Verify
echo "✓ .env.local created"
```

### Step 3: Setup GitHub Actions

```bash
# Already created in .github/workflows/ci.yml

# Verify it's configured:
ls -la .github/workflows/

# Create GitHub secrets:
# 1. SENTRY_AUTH_TOKEN
# 2. STAGING_DEPLOYMENT_URL (optional, for staging deploys)
# 3. SUPABASE_SERVICE_ROLE_KEY (for migrations)
```

### Step 4: Configure Sentry

```bash
# Get Sentry DSN from https://sentry.io/organizations/your-org/

# Add to .env.local:
NEXT_PUBLIC_SENTRY_DSN=https://your-key@sentry.io/your-id

# Initialize Sentry in Next.js:
# (already configured in sentry.client.config.ts)
```

### Step 5: Enable Storybook

```bash
# Generate stories for all components
npm run storybook

# This opens Storybook for component documentation
# Components appear at: http://localhost:6006
```

---

## 📊 AI Agent Workflow (Phase 22+ Automation)

### Trigger Event

```bash
# When you want AI to implement Phase 22:

1. Update PROMPTS.md with Phase 22 requirements
2. Add workflow to .claude/diagpro-workflows.json
3. Create GitHub issue with label: "phase-22-ready"
4. CI triggers AI Agent (via scheduled workflow or webhook)

# Or manually:
AI_PHASE=22 npm run ai:implement
```

### Autonomous Execution

```
┌─────────────────────────────────────────────────────────┐
│ AI Agent Autonomous Workflow                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 1. Read PROMPTS.md (Phase 22 section)                 │
│    └─ Scope, requirements, testing                    │
│                                                        │
│ 2. Read .claude/diagpro-workflows.json                │
│    └─ Step-by-step breakdown, checkpoints            │
│                                                        │
│ 3. Execute Step 1: Database schema (if needed)       │
│    └─ Run: npm run diagpro:migration ...             │
│    └─ Review generated SQL                           │
│    └─ Apply to Supabase                              │
│                                                        │
│ 4. Execute Step 2: API routes                        │
│    └─ Generate files                                  │
│    └─ Implement logic                                │
│    └─ Add error handling                             │
│                                                        │
│ 5. Execute Step 3: UI components                     │
│    └─ Generate React components                      │
│    └─ Add RTL Arabic support                         │
│    └─ Style with Tailwind                            │
│                                                        │
│ 6. Execute Step 4: Testing                           │
│    └─ Run: npm run lint                              │
│    └─ Run: npm run build                             │
│    └─ Run: npm run test:unit                         │
│    └─ Run: npm run test:e2e                          │
│                                                        │
│ 7. Verify RLS Security                               │
│    └─ Run SQL verification queries                   │
│    └─ Test cross-customer access blocking            │
│    └─ Verify admin-only operations                   │
│                                                        │
│ 8. Create Atomic Commits                             │
│    └─ Database schema: 1 commit                      │
│    └─ API routes: 1 commit                           │
│    └─ UI components: 1 commit                        │
│    └─ Tests: 1 commit (if separate)                  │
│                                                        │
│ 9. Create GitHub PR                                   │
│    └─ Title: "Phase 22: [Feature Name]"             │
│    └─ Description: Summary + test results            │
│    └─ Attach screenshots/videos                      │
│    └─ Request review                                 │
│                                                        │
│ 10. Notify You                                        │
│    └─ Slack: PR ready for review                     │
│    └─ Email: Phase 22 implementation complete        │
│                                                        │
└─────────────────────────────────────────────────────────┘

Expected execution time: 90-120 minutes per phase
Your effort needed: 15-20 minutes (just review + merge)
```

---

## 🧪 Testing Phase Setup

### Unit Tests (Vitest)

```bash
# Run unit tests
npm run test:unit

# Run with coverage
npm run test:unit -- --coverage

# Watch mode (during development)
npm run test:unit -- --watch
```

### E2E Tests (Playwright)

```bash
# Install browsers
npx playwright install

# Run e2e tests
npm run test:e2e

# Run in debug mode
npx playwright test --debug

# Run in UI mode (interactive)
npx playwright test --ui
```

### Storybook Stories

```bash
# Start Storybook
npm run storybook

# Build Storybook (for CI)
npm run build-storybook
```

---

## 📋 Checklist for AI Agent Readiness

- [x] PROMPTS.md created with detailed phase prompts
- [x] diagpro-workflows.json configured with steps
- [x] Vitest configured (vitest.config.ts)
- [x] Playwright configured (playwright.config.ts)
- [x] Storybook configured (.storybook/)
- [x] GitHub Actions workflows created (.github/workflows/ci.yml)
- [x] Sentry error tracking configured
- [x] package.json updated with test scripts
- [ ] .env.local created with secrets (manual step)
- [ ] GitHub Actions secrets configured (manual step)
- [ ] Sentry project setup (manual step)

---

## 🚀 Enabling Autonomous Agent (Phase 22+)

### Option A: Manual Trigger

```bash
# When ready to start Phase 22:

# 1. Ensure PROMPTS.md has Phase 22 section
grep -A 100 "Phase 22" PROMPTS.md

# 2. Ensure diagpro-workflows.json has Phase 22 workflow
grep -A 50 "phase_22" .claude/diagpro-workflows.json

# 3. Trigger via Claude Code:
# Paste this into a new Claude Code conversation:
"""
You are DiagPro autonomous build agent.
Phase: 22
Read PROMPTS.md and diagpro-workflows.json
Implement all steps
Run all tests
Create PR
"""

# 4. Monitor progress
# 5. Review PR when ready
# 6. Merge
```

### Option B: Scheduled Trigger (GitHub Actions)

```yaml
# In .github/workflows/ai-agent.yml (create this file):

name: AI Agent Autonomous Build
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM UTC
  workflow_dispatch:    # Manual trigger

jobs:
  ai-agent:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Trigger AI Agent
        run: |
          # Call Claude API with autonomy prompt
          # Create PR automatically
```

### Option C: Issue-Based Trigger

```bash
# In GitHub: Create issue with title "Phase 22 Ready"
# Label: "ai-agent:auto"
# Description: Link to PROMPTS.md Phase 22 section

# GitHub Actions detects label → Triggers AI Agent
```

---

## 📞 AI Agent Guardrails

### Mandatory Safety Checks

```
Before any code push, AI Agent MUST:

✓ Verify all tests pass (npm run test:unit && npm run test:e2e)
✓ Verify no regressions (existing features still work)
✓ Verify RLS security (SQL verification queries)
✓ Verify TypeScript compilation (no type errors)
✓ Verify ESLint passes (npm run lint)
✓ Verify CLAUDE.md compliance (scope boundaries)
✓ Verify atomic commits (logical grouping)
✓ Verify PR description completeness

If any check fails:
  → Do NOT push
  → Investigate and fix
  → Retry tests
  → Only push when all green
```

### Scope Boundaries (Do NOT Cross)

```
AI Agent MUST NOT:
❌ Modify Phase 1-21 code without approval
❌ Change RLS policies (only read for info)
❌ Delete any tables or migrations
❌ Deploy to production (staging only)
❌ Commit directly to main (always PR)
❌ Skip security validation
❌ Add out-of-scope features
❌ Modify CLAUDE.md specifications

If boundary violation detected:
  → Pause execution
  → Request human review
  → Do NOT proceed
```

---

## 📊 Metrics & Monitoring

### Track AI Agent Performance

```bash
# Get stats on PR creation
gh pr list --search "is:pr author:@me" --json title,createdAt

# Get test results
cat test/results/results.json | jq '.stats'

# Get Sentry errors
curl https://sentry.io/api/0/projects/YOUR_ORG/YOUR_PROJECT/issues/
```

### Success Metrics

```
Per Phase Implementation:
  ✓ 100% of requirements met
  ✓ 100% of tests passing
  ✓ 0% regressions
  ✓ 0% security issues
  ✓ Code review: 2+ approvals
  
Timeline:
  ✓ Phase implementation: 90-120 min
  ✓ Your review time: 15-20 min
  ✓ Total: 110-140 min per phase
  
vs Manual: 480+ minutes per phase
Savings: 70-75% time reduction
```

---

## 🔄 Continuous Improvement

### After Each Autonomous Phase

```
1. Review what worked well
2. Update PROMPTS.md with learnings
3. Update diagpro-workflows.json if needed
4. Adjust AI Agent instructions if needed
5. Share results in team docs
```

### Example Post-Phase Update

```markdown
## Phase 22 (WhatsApp Integration) - Learnings

What worked:
✓ Clear prompts led to 95% correct implementation
✓ Workflow steps prevented scope creep
✓ RLS validation caught 2 edge cases

What to improve:
⚠ File upload validation needed more detail
⚠ Error messages could be clearer
⚠ Testing for edge cases took longer

Next time:
→ Add more test scenarios to PROMPTS.md
→ Clarify error handling requirements
→ Include edge case examples
```

---

## 🎯 Next Steps

### Immediate (Today)

- [x] Create all configuration files
- [x] Document AI Agent setup
- [x] Create guardrails

### This Week

- [ ] Complete Phase 20B-1 (manual)
- [ ] Complete Phase 20B-2, 20B-3, 20C-1 (with tools)
- [ ] Test GitHub Actions CI/CD
- [ ] Verify Sentry error tracking

### Next Week

- [ ] Prepare Phase 22 prompts
- [ ] Prepare Phase 22 workflow
- [ ] Test autonomous implementation on Phase 22
- [ ] Review AI-generated PR
- [ ] Refine based on results

### Phase 22+

- [ ] Trigger AI Agent
- [ ] Monitor execution
- [ ] Review PR (15-20 min)
- [ ] Merge
- [ ] Move to Phase 23

---

## 📚 Related Files

- `PROMPTS.md` — Phase scope and requirements
- `.claude/diagpro-workflows.json` — Multi-step workflows
- `CLAUDE.md` — Project specifications (guardrails)
- `package.json` — Test and build scripts
- `.github/workflows/ci.yml` — GitHub Actions pipeline
- `vitest.config.ts` — Unit test configuration
- `playwright.config.ts` — E2E test configuration
- `.storybook/` — Component documentation

---

## ❓ FAQ

**Q: Will AI Agent mess up the code?**
A: No. Guardrails prevent:
- Pushing if tests fail
- Commits if RLS validation fails
- PRs without full description
- Modifying restricted code
- Skipping security checks

**Q: How long does autonomous implementation take?**
A: ~90-120 minutes per phase (vs 480+ minutes manual)
Your effort: 15-20 min review time

**Q: Can AI handle complex phases like Agent implementation?**
A: Yes, if prompts are detailed. Phases 22-24 are good tests.
Phase 25+ (multi-branch SaaS) may need more guidance.

**Q: What if AI makes a mistake?**
A: PRs allow full code review. You can:
- Request changes
- Ask AI to fix specific issues
- Reject and retry
- Revert if merged

**Q: Can I run multiple AI Agents in parallel?**
A: Yes, on different phases. Recommend:
- Phase 22: Agent A
- Phase 23: Agent B
- Agent C monitors CI/CD
Each handles one phase to avoid conflicts.

---

## 🚀 Ready?

```bash
# Verify all tools installed
npm run diagpro:help
npm run lint
npm run build
npm run test:unit
npm run test:e2e

# When ready for Phase 22:
# Trigger AI Agent with:
# "Implement Phase 22 per PROMPTS.md and diagpro-workflows.json"

# AI does 90% of work
# You review + merge in 20 minutes
# Done! 🎉
```

---

**Building DiagPro Manager V1 with autonomous AI agents.**

Phase 22 onwards: 75% faster with AI Agent autonomy ⚡
