# 🚀 DiagPro Build Acceleration — Quick Start (5 Minutes)

**Goal:** Get you building faster immediately.

---

## Step 1: Know Your Tools (Already Created for You)

| Tool | File | Purpose |
|------|------|---------|
| **Prompts** | `PROMPTS.md` | Copy-paste prompts for features |
| **CLI** | `scripts/diagpro-cli.js` | Generate migrations, components, tests |
| **Workflows** | `.claude/diagpro-workflows.json` | Multi-step phase plans |
| **This guide** | `TOOLS_AND_IMPROVEMENTS.md` | Full documentation |

---

## Step 2: Next Phase (Phase 20B-2)

### Option A: Manual Implementation (Classic Way)

```bash
# 1. Read CLAUDE.md
# 2. Design in your head
# 3. Code it
# 4. Test it
# 5. Commit it

Estimated time: 120 minutes
```

### Option B: Optimized Way (Recommended) ⭐

```bash
# 1. Read the workflow
cat .claude/diagpro-workflows.json | grep -A 30 "phase_20B_2"

# 2. Get the prompt
grep -A 100 "Phase 20B-2" PROMPTS.md

# 3. Copy the entire prompt section

# 4. Open Claude Code or Cursor

# 5. Create new conversation and paste the prompt

# 6. Let Claude implement → you review → commit

Estimated time: 45 minutes (73% faster!)
```

---

## Step 3: The Exact Workflow

### For Phase 20B-2 (Admin Document List UI)

#### 1️⃣ Prepare (2 minutes)

```bash
# Read the prompt section
grep -A 100 "Phase 20B-2: Admin Document List UI" PROMPTS.md
```

**You'll see:**
```
Phase 20B-2: Admin Document List UI

Context:
- Phase 20B-1 (database schema) is complete
- customer_documents table exists with RLS

Requirements:
1. Create /admin/documents/page.tsx
2. Display documents in table
3. Add filters
...
```

#### 2️⃣ Implement (40 minutes)

```bash
# Option 1: Manual Coding
# → Open src/app/admin/documents/page.tsx
# → Code it based on prompt

# Option 2: Claude Code
# → Paste entire prompt into Claude Code
# → Claude implements 90% of code
# → You refine 10%
```

#### 3️⃣ Review (5 minutes)

```bash
# Check the requirements are met
npm run dev

# Open http://localhost:3000/admin/documents
# ✓ Can see documents table
# ✓ Filters work
# ✓ Visibility toggle works
# ✓ No file upload (placeholder only)
```

#### 4️⃣ Commit (3 minutes)

```bash
# Use the template from PROMPTS.md
git add .
git commit -m "Phase 20B-2: Admin document list UI

This commit adds the admin interface for managing customer documents.

Changes:
- src/app/admin/documents/page.tsx: List all documents with filters
- src/components/admin/DocumentTable.tsx: Reusable document table
- src/lib/documents.ts: Document query helpers

Testing:
- Admin logs in → sees all documents
- Filters work correctly (customer, type, visibility)
- Toggle visible → RLS enforces access
"
```

---

## Step 4: Use CLI Tools (Optional, But Helpful)

```bash
# Generate boilerplate components
npm run diagpro:component -- --name DocumentTable --type table

# Output: src/components/DocumentTable.tsx (with stub)
# Then: fill in logic

# Or generate tests
npm run diagpro:test -- --scenario admin_views_documents --phase 20B-2

# Output: test/scenarios/admin_views_documents.test.ts (with stub)
# Then: add test logic
```

---

## Step 5: Scale Up with AI

### Single Feature (Phase 20B-2)

```
You: Copy prompt from PROMPTS.md
   ↓
Claude: Implements 90% in 15 min
   ↓
You: Review + test (20 min)
   ↓
You: Commit (5 min)
---
Total: 40 min (vs 120 min manual)
```

### Multiple Features (Phases 20B-2 + 20B-3 + 20C-1)

```
You: Define scope in PROMPTS.md (already done)
   ↓
You: Create workflow in .claude/diagpro-workflows.json (already done)
   ↓
Claude (AI Agent): Implements all 3 phases (90 min)
   ↓
You: Final review + verify RLS (30 min)
   ↓
You: Commit all (5 min)
---
Total: 125 min for 3 features (vs 360 min manual)
= 65% faster ⚡
```

---

## Step 6: What You Get

### After Phase 20B-2

```
✅ Admin can view all customer documents
✅ Admin can filter (by customer, type, visibility)
✅ Admin can toggle visibility for customer
✅ RLS enforces: customer sees only own visible docs
✅ Placeholder for upload (Phase 20C later)
```

### After Phase 20B-3

```
✅ Customer portal shows own documents only
✅ Read-only access (no delete/modify)
✅ Only visible documents shown
✅ Clean UI with Arabic labels
```

### After Phase 20C-1

```
✅ Admin can upload documents (PDF, JPG, PNG max 50MB)
✅ File metadata stored in customer_documents
✅ Validation (file type, size, auth)
✅ Ready for Storage integration (Phase 20C-2)
```

---

## ⏱️ Timeline (Optimized)

```
Today (June 13):
  ✅ Phase 20B-1 database schema (already created)
  
Tomorrow (June 14):
  → Phase 20B-2 (Admin UI) — 45 min with tools
  → Phase 20B-3 (Customer UI) — 45 min with tools
  
June 15:
  → Phase 20C-1 (File upload validation) — 60 min
  
June 16:
  → Phase 20C-2 (Storage integration) — 90 min
  
June 17:
  → Phase 21 (Booking supervisor agent) — 120 min with AI
  
= Full build in 5-6 days (vs 3-4 weeks manual)
```

---

## 💡 Pro Tips

### Tip 1: Copy/Paste the Prompt

```bash
# Don't retype or paraphrase
# Copy the ENTIRE prompt from PROMPTS.md
# Paste directly into Claude Code

# Why?
# - AI gets full context
# - 95% consistency
# - Better code quality
# - Less iteration needed
```

### Tip 2: Test as You Go

```bash
npm run dev

# After implementing Phase 20B-2:
# Open http://localhost:3000/admin/documents
# ✓ Page loads
# ✓ Documents display
# ✓ Filters work

# Then move to next phase
```

### Tip 3: Use Atomic Commits

```bash
# Each phase = 1 commit
git commit -m "Phase 20B-2: Admin document list UI"

# Not:
git commit -m "Add document list, table, filters, hooks"

# Why? Easier to review, easier to blame/revert
```

### Tip 4: Keep PROMPTS.md Updated

```bash
# After each phase, update PROMPTS.md with:
# - What worked well
# - What was skipped
# - Best practices learned
# - Dependencies discovered

# Next person (or you) reuses and improves
```

---

## 🎯 Your Next Action (Right Now)

### Option 1: Continue with Phase 20B-1 (Database)

```bash
# 1. Review migration 008 in /supabase/migrations/
# 2. Test it locally or in Supabase
# 3. Commit it
git commit -m "Phase 20B-1: Customer documents foundation (schema + RLS)"

# 2. Then start Phase 20B-2
```

### Option 2: Jump to Phase 20B-2 (UI)

```bash
# 1. Open PROMPTS.md
grep -A 100 "Phase 20B-2" PROMPTS.md

# 2. Copy the prompt

# 3. Open Claude Code (or Cursor)
# → New conversation
# → Paste the prompt
# → Let it implement

# 4. Test + Commit
npm run dev
# ... test at http://localhost:3000/admin/documents
git commit -m "Phase 20B-2: Admin document list UI"
```

---

## 📚 Additional Resources

| Resource | Location | When to Use |
|----------|----------|-------------|
| Full prompts | `PROMPTS.md` | Implementing a feature |
| Workflow plans | `.claude/diagpro-workflows.json` | Planning multi-step phases |
| Project spec | `CLAUDE.md` | Understanding constraints |
| Build tools | `TOOLS_AND_IMPROVEMENTS.md` | Learning about all available tools |
| CLI tools | `scripts/diagpro-cli.js` | Generating boilerplate |
| This guide | `QUICK_START.md` | Getting started (you are here) |

---

## ❓ FAQ

**Q: Should I use Claude Code or manual coding?**
A: Use Claude Code for:
- Pages, forms, tables (reusable patterns)
- CRUD operations
- Boilerplate

Use manual coding for:
- Custom business logic
- Security-critical features
- Complex integrations

**Q: How much time does this actually save?**
A:
- Single feature: 65-70% faster (120 min → 45 min)
- 3 features: 65% faster (360 min → 125 min)
- Whole V1: 60-65% faster (estimated 8 weeks → 3 weeks with AI)

**Q: What if Claude Code gets it wrong?**
A: 
- Very rare for schema/CRUD (95%+ success)
- RLS can be complex (70-80% success, you verify)
- Always test before committing
- Adjust prompt if needed

**Q: Can I use this with a full AI agent?**
A: Yes! In Phase 21+, you can:
- Define workflow in diagpro-workflows.json
- AI Agent reads it + PROMPTS.md
- Agent autonomously implements all steps
- You just review

---

## 🚀 Ready?

```bash
# 1. Read Phase 20B-2 prompt
grep -A 100 "Phase 20B-2" PROMPTS.md

# 2. Copy it

# 3. Open Claude Code

# 4. Paste the prompt

# 5. Let it build

# 6. Test

# 7. Commit

# 8. Celebrate 🎉
```

---

**Build faster. Build better. Build smarter.** ⚡

For questions or issues, see `TOOLS_AND_IMPROVEMENTS.md` → Support section.
