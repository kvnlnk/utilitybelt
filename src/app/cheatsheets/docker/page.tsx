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
    title: "Container Management",
    commands: [
      { command: "docker ps", description: "List running containers" },
      { command: "docker ps -a", description: "List all containers (including stopped)" },
      { command: "docker run <image>", description: "Run a container from an image" },
      { command: "docker run -d <image>", description: "Run a container in detached mode" },
      { command: "docker run -it <image> /bin/bash", description: "Run interactively with shell" },
      { command: "docker run -p 8080:80 <image>", description: "Map host port to container port" },
      { command: "docker start <container>", description: "Start a stopped container" },
      { command: "docker stop <container>", description: "Stop a running container" },
      { command: "docker restart <container>", description: "Restart a container" },
      { command: "docker rm <container>", description: "Remove a container" },
      { command: "docker rm -f <container>", description: "Force remove a running container" },
    ],
  },
  {
    title: "Image Management",
    commands: [
      { command: "docker images", description: "List local images" },
      { command: "docker pull <image>", description: "Pull an image from a registry" },
      { command: "docker build -t <name> .", description: "Build an image from a Dockerfile" },
      { command: "docker rmi <image>", description: "Remove an image" },
      { command: "docker tag <src> <target>", description: "Tag an image" },
      { command: "docker push <image>", description: "Push an image to a registry" },
      { command: "docker image prune", description: "Remove unused images" },
    ],
  },
  {
    title: "Logs & Debugging",
    commands: [
      { command: "docker logs <container>", description: "View container logs" },
      { command: "docker logs -f <container>", description: "Follow log output" },
      { command: "docker exec -it <container> /bin/sh", description: "Run a command inside a running container" },
      { command: "docker inspect <container>", description: "View detailed container info in JSON" },
      { command: "docker stats", description: "Show live resource usage of containers" },
      { command: "docker top <container>", description: "Show running processes in a container" },
    ],
  },
  {
    title: "Volumes & Data",
    commands: [
      { command: "docker volume ls", description: "List volumes" },
      { command: "docker volume create <name>", description: "Create a volume" },
      { command: "docker volume rm <name>", description: "Remove a volume" },
      { command: "docker volume prune", description: "Remove all unused volumes" },
      { command: "docker run -v <host>:<container> <image>", description: "Bind mount a host path" },
      { command: "docker run -v <vol>:<container> <image>", description: "Mount a named volume" },
    ],
  },
  {
    title: "Networks",
    commands: [
      { command: "docker network ls", description: "List networks" },
      { command: "docker network create <name>", description: "Create a network" },
      { command: "docker network rm <name>", description: "Remove a network" },
      { command: "docker network connect <net> <container>", description: "Connect a container to a network" },
      { command: "docker network disconnect <net> <container>", description: "Disconnect a container from a network" },
    ],
  },
  {
    title: "Docker Compose",
    commands: [
      { command: "docker compose up", description: "Create and start containers" },
      { command: "docker compose up -d", description: "Start in detached mode" },
      { command: "docker compose down", description: "Stop and remove containers, networks" },
      { command: "docker compose down -v", description: "Also remove volumes" },
      { command: "docker compose logs", description: "View logs from all services" },
      { command: "docker compose ps", description: "List containers managed by Compose" },
      { command: "docker compose build", description: "Build or rebuild services" },
      { command: "docker compose restart", description: "Restart all services" },
    ],
  },
  {
    title: "Cleanup",
    commands: [
      { command: "docker system prune", description: "Remove unused data (containers, networks, images)" },
      { command: "docker system prune -a", description: "Remove all unused data including unused images" },
      { command: "docker container prune", description: "Remove all stopped containers" },
      { command: "docker image prune -a", description: "Remove all unused images" },
    ],
  },
];

export default function DockerCheatsheet() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Docker Cheatsheet</h1>
        <p className="text-muted-foreground mt-1">
          Essential Docker commands for managing containers, images, volumes, and networks.
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
                      <th className="text-left p-3 font-medium w-[45%]">Command</th>
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
