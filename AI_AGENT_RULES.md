# AI Agent Rules & Guidelines

## 🎯 Core Mission

Follow these rules religiously when working on any codebase. These principles ensure clean, maintainable, and production-ready code.

---

## 📋 FUNDAMENTAL PRINCIPLES

### Code Quality Standards

- **Write clean, simple, readable code** - Prioritize clarity over cleverness
- **Implement features in the simplest possible way** - Avoid over-engineering
- **Keep files small and focused** - Maximum 200 lines per file
- **Test after every meaningful change** - Verify functionality immediately
- **Focus on core functionality before optimization** - Make it work first
- **Use clear, consistent naming** - Names should be self-documenting
- **Think thoroughly before coding** - Write 2-3 reasoning paragraphs before implementation
- **ALWAYS write simple, clean and modular code** - Break complex logic into smaller functions
- **Use clear and easy-to-understand language** - Write in short, concise sentences

---

## 🚨 CONTEXT FIRST — NO GUESSWORK

### Before Writing Any Code:

1. **DO NOT WRITE A SINGLE LINE OF CODE UNTIL YOU UNDERSTAND THE SYSTEM**
2. **IMMEDIATELY LIST FILES IN THE TARGET DIRECTORY** - Understand the project structure
3. **ASK ONLY THE NECESSARY CLARIFYING QUESTIONS** - No fluff, be direct
4. **DETECT AND FOLLOW EXISTING PATTERNS** - Match style, structure, and logic
5. **IDENTIFY ENVIRONMENT VARIABLES, CONFIG FILES, AND SYSTEM DEPENDENCIES**

### Discovery Process:

```
1. List directory contents
2. Read package.json / requirements.txt / similar config files
3. Identify main entry points
4. Understand existing architecture patterns
5. Check for linting rules and code style guides
```

---

## 🔍 CHALLENGE THE REQUEST — DON'T BLINDLY FOLLOW

### Question Everything:

- **IDENTIFY EDGE CASES IMMEDIATELY** - What could go wrong?
- **ASK SPECIFICALLY: WHAT ARE THE INPUTS? OUTPUTS? CONSTRAINTS?**
- **QUESTION EVERYTHING THAT IS VAGUE OR ASSUMED** - Get clarity first
- **REFINE THE TASK UNTIL THE GOAL IS BULLET-PROOF** - No ambiguity allowed

### Required Clarifications:

- What are the expected input formats?
- What should the output look like?
- What are the performance requirements?
- What are the browser/environment constraints?
- Are there any security considerations?

---

## 🏗️ HOLD THE STANDARD — EVERY LINE MUST COUNT

### Code Standards:

- **CODE MUST BE MODULAR, TESTABLE, CLEAN**
- **COMMENT METHODS. USE DOCSTRINGS. EXPLAIN LOGIC**
- **SUGGEST BEST PRACTICES IF CURRENT APPROACH IS OUTDATED**
- **IF YOU KNOW A BETTER WAY — SPEAK UP**

### Documentation Requirements:

```typescript
/**
 * Brief description of what this function does
 * @param {type} paramName - Description of parameter
 * @returns {type} Description of return value
 * @example
 * // Usage example
 * functionName(exampleParam);
 */
```

---

## 🌐 ZOOM OUT — THINK BIGGER THAN JUST THE FILE

### System Design Thinking:

- **DON'T PATCH. DESIGN** - Think holistically about solutions
- **THINK ABOUT MAINTAINABILITY, USABILITY, SCALABILITY**
- **CONSIDER ALL COMPONENTS** - Frontend, backend, database, user interface
- **PLAN FOR THE USER EXPERIENCE** - Not just functionality

### Architecture Considerations:

- How does this change affect other parts of the system?
- Will this solution scale with increased usage?
- Is this maintainable by other developers?
- Does this follow established patterns in the codebase?

---

## 🐛 ERROR FIXING PROTOCOL

### Debugging Approach:

1. **DO NOT JUMP TO CONCLUSIONS!** - Consider multiple possible causes
2. **Explain the problem in plain English** - Make it understandable
3. **Make minimal necessary changes** - Change as few lines as possible
4. **In case of strange errors** - Ask user to perform Perplexity web search for latest info

### Error Resolution Steps:

```
1. Reproduce the error
2. Identify the root cause (not just symptoms)
3. Consider multiple solutions
4. Choose the simplest effective fix
5. Test the fix thoroughly
6. Document the solution
```

---

## 🏗️ BUILDING PROCESS

### Development Workflow:

- **Verify each new feature works** - Tell user how to test it
- **DO NOT write complicated and confusing code** - Opt for simple & modular approach
- **When not sure what to do** - Tell user to perform a web search

### Testing Guidelines:

```
1. Unit tests for individual functions
2. Integration tests for component interactions
3. Manual testing instructions for users
4. Edge case validation
5. Performance considerations
```

---

## 💬 COMMENTING STANDARDS

### Comment Requirements:

- **ALWAYS try to add more helpful and explanatory comments**
- **NEVER delete old comments** - Unless obviously wrong/obsolete
- **Include LOTS of explanatory comments** - Write well-documented code
- **Document all changes and their reasoning** - In the comments you write
- **Use clear and easy-to-understand language** - Write in short sentences

### Comment Types:

```typescript
// Single line comments for brief explanations

/**
 * Multi-line comments for complex logic
 * Explain the "why" not just the "what"
 */

// TODO: Future improvements or known issues
// FIXME: Known bugs that need attention
// NOTE: Important information for other developers
```

---

## 🛠️ TECHNOLOGY-SPECIFIC GUIDELINES

### Next.js/React Projects:

- Use TypeScript for type safety
- Follow React best practices (hooks, functional components)
- Implement proper error boundaries
- Use Next.js built-in optimizations (Image, Link, etc.)
- Follow the app router pattern when applicable

### File Organization:

```
/src
  /components    # Reusable UI components
  /pages         # Page components
  /utils         # Helper functions
  /types         # TypeScript type definitions
  /hooks         # Custom React hooks
  /styles        # CSS/Tailwind styles
```

---

## ⚡ QUICK REFERENCE CHECKLIST

### Before Starting Any Task:

- [ ] Understand the project structure
- [ ] Read existing code patterns
- [ ] Identify the specific requirement
- [ ] Question any ambiguities
- [ ] Plan the approach

### Before Submitting Code:

- [ ] Code is clean and readable
- [ ] Functions are small and focused
- [ ] Comments explain the logic
- [ ] Error handling is implemented
- [ ] Testing instructions are provided
- [ ] Code follows existing patterns

### After Implementation:

- [ ] Test the functionality
- [ ] Check for edge cases
- [ ] Verify performance
- [ ] Document any changes
- [ ] Consider future maintainability

---

## 🚫 ABSOLUTE DON'TS

- Never write code without understanding the context
- Never ignore existing code patterns
- Never skip error handling
- Never write uncommented complex logic
- Never make changes without testing
- Never over-engineer simple solutions
- Never delete old comments carelessly
- Never assume requirements without clarification

---

_Remember: These rules exist to ensure high-quality, maintainable code. Follow them consistently to deliver professional results._
