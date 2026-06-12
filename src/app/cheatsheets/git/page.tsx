"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Command {
  command: string;
  description: string;
}

interface Section {
  title: string;
  commands: Command[];
}

const sections: Section[] = [
  {
    title: "Configuration",
    commands: [
      { command: "git config --global user.name \"Name\"", description: "Set your name globally" },
      { command: "git config --global user.email \"email\"", description: "Set your email globally" },
      { command: "git config --global alias.<name> <command>", description: "Create a Git alias" },
      { command: "git config --list", description: "List all configuration settings" },
    ],
  },
  {
    title: "Getting Started",
    commands: [
      { command: "git init", description: "Initialize a new Git repository" },
      { command: "git clone <url>", description: "Clone an existing repository" },
      { command: "git clone <url> <dir>", description: "Clone into a specific directory" },
    ],
  },
  {
    title: "Basic Workflow",
    commands: [
      { command: "git status", description: "Show working tree status" },
      { command: "git add <file>", description: "Stage a file" },
      { command: "git add .", description: "Stage all changes" },
      { command: "git commit -m \"message\"", description: "Commit staged changes" },
      { command: "git commit -am \"message\"", description: "Add and commit in one step (tracked files)" },
      { command: "git rm <file>", description: "Remove a file from tracking" },
      { command: "git mv <old> <new>", description: "Rename a tracked file" },
    ],
  },
  {
    title: "Branching & Merging",
    commands: [
      { command: "git branch", description: "List local branches" },
      { command: "git branch <name>", description: "Create a new branch" },
      { command: "git checkout <branch>", description: "Switch to a branch" },
      { command: "git checkout -b <name>", description: "Create and switch to a new branch" },
      { command: "git merge <branch>", description: "Merge a branch into the current branch" },
      { command: "git rebase <branch>", description: "Rebase current branch onto another" },
      { command: "git branch -d <name>", description: "Delete a branch (safe)" },
      { command: "git branch -D <name>", description: "Force delete a branch" },
    ],
  },
  {
    title: "Remote Repositories",
    commands: [
      { command: "git remote -v", description: "List remote repositories" },
      { command: "git remote add <name> <url>", description: "Add a remote" },
      { command: "git push <remote> <branch>", description: "Push commits to a remote" },
      { command: "git push -u <remote> <branch>", description: "Push and set upstream" },
      { command: "git pull", description: "Fetch and merge from upstream" },
      { command: "git fetch", description: "Fetch changes without merging" },
      { command: "git remote remove <name>", description: "Remove a remote" },
    ],
  },
  {
    title: "Inspection & History",
    commands: [
      { command: "git log", description: "Show commit history" },
      { command: "git log --oneline", description: "Compact commit history" },
      { command: "git log --graph", description: "Show commit history as a graph" },
      { command: "git diff", description: "Show unstaged changes" },
      { command: "git diff --staged", description: "Show staged changes" },
      { command: "git show <commit>", description: "Show details of a specific commit" },
      { command: "git blame <file>", description: "Show who changed each line" },
    ],
  },
  {
    title: "Undoing Changes",
    commands: [
      { command: "git checkout -- <file>", description: "Discard unstaged changes" },
      { command: "git reset <file>", description: "Unstage a file" },
      { command: "git reset --soft HEAD~1", description: "Undo last commit, keep changes staged" },
      { command: "git reset --hard HEAD~1", description: "Undo last commit, discard changes" },
      { command: "git revert <commit>", description: "Create a new commit that undoes a previous one" },
      { command: "git stash", description: "Stash working directory changes" },
      { command: "git stash pop", description: "Apply and remove the latest stash" },
      { command: "git stash list", description: "List stashes" },
    ],
  },
  {
    title: "Tagging",
    commands: [
      { command: "git tag", description: "List tags" },
      { command: "git tag <name>", description: "Create a lightweight tag" },
      { command: "git tag -a <name> -m \"msg\"", description: "Create an annotated tag" },
      { command: "git push --tags", description: "Push tags to remote" },
    ],
  },
];

export default function GitCheatsheet() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Git Cheatsheet</h1>
        <p className="text-muted-foreground mt-1">
          Common Git commands for daily development workflow.
        </p>
      </div>

      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium w-[40%]">Command</th>
                      <th className="text-left p-3 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.commands.map((cmd, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="p-3 font-mono text-xs break-all">{cmd.command}</td>
                        <td className="p-3 text-muted-foreground">{cmd.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
