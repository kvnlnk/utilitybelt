"use client";

import { Card, CardContent } from "@/components/ui/card";

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
    title: "Cluster Info & Nodes",
    commands: [
      { command: "kubectl cluster-info", description: "Display cluster endpoint and service URLs" },
      { command: "kubectl cluster-info dump", description: "Dump cluster diagnostics (useful for debugging)" },
      { command: "kubectl get nodes", description: "List all nodes in the cluster" },
      { command: "kubectl describe node <name>", description: "Show detailed node info (resources, pods, taints)" },
      { command: "kubectl top node", description: "Show CPU/memory usage per node (requires metrics-server)" },
      { command: "kubectl cordon <name>", description: "Mark node as unschedulable (safe for maintenance)" },
      { command: "kubectl uncordon <name>", description: "Mark node as schedulable again" },
      { command: "kubectl drain <name>", description: "Evict pods from node for maintenance" },
      { command: "kubectl taint nodes <name> <key>=<value>:<effect>", description: "Add a taint (NoSchedule, PreferNoSchedule, NoExecute)" },
    ],
  },
  {
    title: "Pod Management",
    commands: [
      { command: "kubectl get pods", description: "List pods in current namespace" },
      { command: "kubectl get pods -A", description: "List pods across all namespaces" },
      { command: "kubectl get pods -o wide", description: "Show pods with node IP and assigned node" },
      { command: "kubectl get pods --watch", description: "Watch pod changes in real time" },
      { command: "kubectl describe pod <name>", description: "Detailed pod info (events, conditions, containers)" },
      { command: "kubectl logs <pod>", description: "Print pod logs (use -f to follow)" },
      { command: "kubectl logs <pod> -c <container>", description: "Logs from a specific container in multi-container pod" },
      { command: "kubectl logs --previous <pod>", description: "Logs from the previous (crashed) instance" },
      { command: "kubectl exec -it <pod> -- /bin/sh", description: "Open interactive shell in a pod" },
      { command: "kubectl exec -it <pod> -c <container> -- /bin/sh", description: "Shell into a specific container" },
      { command: "kubectl delete pod <name>", description: "Delete a pod (Deployment recreates it)" },
      { command: "kubectl delete pod <name> --grace-period=0 --force", description: "Force delete a stuck pod" },
      { command: "kubectl cp <pod>:<path> <local-path>", description: "Copy files from pod to local machine" },
      { command: "kubectl cp <local-path> <pod>:<path>", description: "Copy files from local to pod" },
    ],
  },
  {
    title: "Deployments & Workloads",
    commands: [
      { command: "kubectl create deployment <name> --image=<img>", description: "Create a deployment from an image" },
      { command: "kubectl get deployments", description: "List deployments" },
      { command: "kubectl describe deployment <name>", description: "Detailed deployment info" },
      { command: "kubectl scale deployment <name> --replicas=5", description: "Scale replicas up or down" },
      { command: "kubectl set image deployment/<name> <container>=<new-image>", description: "Update container image (triggers rollout)" },
      { command: "kubectl rollout status deployment/<name>", description: "Check rollout progress" },
      { command: "kubectl rollout history deployment/<name>", description: "Show rollout history" },
      { command: "kubectl rollout undo deployment/<name>", description: "Rollback to the previous revision" },
      { command: "kubectl rollout undo deployment/<name> --to-revision=2", description: "Rollback to a specific revision" },
      { command: "kubectl rollout restart deployment/<name>", description: "Restart pods without changing the image" },
      { command: "kubectl pause deployment/<name>", description: "Pause rollout (batch changes before resuming)" },
      { command: "kubectl resume deployment/<name>", description: "Resume paused rollout" },
      { command: "kubectl get statefulsets", description: "List StatefulSets (stateful workloads)" },
      { command: "kubectl get daemonsets -A", description: "List DaemonSets (one pod per node)" },
      { command: "kubectl get jobs", description: "List completed / running Jobs" },
      { command: "kubectl create job --from=cronjob/<name> <job-name>", description: "Manually trigger a CronJob" },
    ],
  },
  {
    title: "Services & Networking",
    commands: [
      { command: "kubectl get services", description: "List services in current namespace" },
      { command: "kubectl expose deployment <name> --port=80 --target-port=8080", description: "Expose a deployment as a service" },
      { command: "kubectl expose deployment <name> --type=LoadBalancer --port=80", description: "Expose externally via LoadBalancer" },
      { command: "kubectl describe service <name>", description: "Detailed service info (endpoints, selector, ports)" },
      { command: "kubectl get endpoints", description: "Show actual pod IPs behind a service" },
      { command: "kubectl port-forward pod/<name> 8080:80", description: "Forward local port to pod (debugging)" },
      { command: "kubectl port-forward service/<name> 8080:80", description: "Forward local port to a service" },
      { command: "kubectl get ingress", description: "List Ingress rules for HTTP routing" },
      { command: "kubectl describe ingress <name>", description: "Show Ingress details (hosts, TLS, backends)" },
      { command: "kubectl run test- pod --rm -it --image=curlimages/curl -- sh", description: "Ephemeral pod for network debugging" },
    ],
  },
  {
    title: "ConfigMaps & Secrets",
    commands: [
      { command: "kubectl create configmap <name> --from-literal=key=val", description: "Create ConfigMap from literal" },
      { command: "kubectl create configmap <name> --from-file=config.yaml", description: "Create ConfigMap from file" },
      { command: "kubectl get configmaps", description: "List ConfigMaps" },
      { command: "kubectl create secret generic <name> --from-literal=key=val", description: "Create a generic Secret" },
      { command: "kubectl get secrets", description: "List secrets (values are not shown by default)" },
      { command: "kubectl get secret <name> -o yaml", description: "View secret (base64-encoded)" },
      { command: "kubectl get secret <name> -o jsonpath=\"{.data.key}\" | base64 -d", description: "Decode a specific secret value" },
      { command: "kubectl create secret tls <name> --cert=cert.pem --key=key.pem", description: "Create TLS secret for Ingress" },
      { command: "kubectl create secret docker-registry <name> --docker-server=... --docker-username=... --docker-password=...", description: "Create imagePullSecret for private registries" },
    ],
  },
  {
    title: "Namespaces",
    commands: [
      { command: "kubectl get namespaces", description: "List all namespaces" },
      { command: "kubectl create namespace <name>", description: "Create a new namespace" },
      { command: "kubectl delete namespace <name>", description: "Delete namespace and everything inside" },
      { command: "kubectl config set-context --current --namespace=<name>", description: "Switch default namespace for current context" },
      { command: "kubectl get pods -n <namespace>", description: "List pods in a specific namespace" },
      { command: "kubectl get all -n <namespace>", description: "List all resource types in a namespace" },
      { command: "kubectl api-resources --namespaced=true", description: "List resource types that are namespaced" },
    ],
  },
  {
    title: "kubectl Config & Contexts",
    commands: [
      { command: "kubectl config view", description: "Show kubeconfig (use --minify to flatten)" },
      { command: "kubectl config get-contexts", description: "List all contexts" },
      { command: "kubectl config current-context", description: "Show the active context" },
      { command: "kubectl config use-context <name>", description: "Switch to a different cluster/context" },
      { command: "kubectl config set-context <name> --cluster=... --user=... --namespace=...", description: "Create or modify a context" },
      { command: "kubectl config rename-context <old> <new>", description: "Rename a context" },
      { command: "kubectl config delete-context <name>", description: "Delete a context" },
      { command: "kubectl config set-credentials <name> --token=...", description: "Set credentials (token, cert, or user/password)" },
    ],
  },
  {
    title: "Debugging & Troubleshooting",
    commands: [
      { command: "kubectl get events --sort-by='.lastTimestamp'", description: "List events sorted by time (useful during failures)" },
      { command: "kubectl get events -n <ns> --field-selector type=Warning", description: "Show only warning events" },
      { command: "kubectl describe pod <name> | grep -A 5 Events", description: "Focus on pod events during crash loop" },
      { command: "kubectl get pods --field-selector=status.phase=Failed", description: "List all failed pods" },
      { command: "kubectl get pods --field-selector=status.phase=Pending", description: "List all pending pods (stuck scheduling)" },
      { command: "kubectl run debug --image=nicolaka/netshoot -it --rm", description: "Ephemeral debug pod with network tools" },
      { command: "kubectl run debug --image=busybox -it --rm -- sh", description: "Lightweight shell for debugging" },
      { command: "kubectl get pods -o json | jq '.items[] | {name: .metadata.name, status: .status.containerStatuses[].state}'", description: "Find pods in crash loop (requires jq)" },
    ],
  },
  {
    title: "Resource Management (Requests & Limits)",
    commands: [
      { command: "kubectl top pod", description: "Show CPU/memory usage per pod" },
      { command: "kubectl top pod --containers", description: "Show per-container resource usage" },
      { command: "kubectl describe nodes | grep -A 5 -B 5 'Requests\\|Limits'", description: "Check node resource allocation" },
      { command: "kubectl get pods -o custom-columns=Name:.metadata.name,CPU:.spec.containers[0].resources.requests.cpu,Memory:.spec.containers[0].resources.requests.memory", description: "List pods with their resource requests" },
    ],
  },
  {
    title: "Storage (PVCs & PVs)",
    commands: [
      { command: "kubectl get pvc", description: "List PersistentVolumeClaims" },
      { command: "kubectl get pv", description: "List PersistentVolumes" },
      { command: "kubectl describe pvc <name>", description: "Show PVC details (status, capacity, access mode)" },
      { command: "kubectl delete pvc <name>", description: "Delete a PVC (and potentially its bound PV)" },
      { command: "kubectl get storageclass", description: "List StorageClasses for dynamic provisioning" },
    ],
  },
  {
    title: "RBAC (Roles & Permissions)",
    commands: [
      { command: "kubectl get roles -A", description: "List Roles across all namespaces" },
      { command: "kubectl get rolebindings -A", description: "List RoleBindings across all namespaces" },
      { command: "kubectl get clusterroles | head", description: "List ClusterRoles (cluster-wide permissions)" },
      { command: "kubectl describe clusterrole <name>", description: "Show permissions granted by a ClusterRole" },
      { command: "kubectl auth can-i <verb> <resource>", description: "Check if you (current user) can perform an action" },
      { command: "kubectl auth can-i <verb> <resource> --as <user>", description: "Check permissions for another user or ServiceAccount" },
      { command: "kubectl create serviceaccount <name>", description: "Create a ServiceAccount" },
      { command: "kubectl create token <sa>", description: "Create a token for a ServiceAccount" },
    ],
  },
  {
    title: "Quick Apply & Delete (YAML)",
    commands: [
      { command: "kubectl apply -f <file.yaml>", description: "Create or update resources from a YAML file" },
      { command: "kubectl apply -f <dir>/", description: "Apply all YAML files in a directory" },
      { command: "kubectl apply -f https://<url>", description: "Apply from a remote URL" },
      { command: "kubectl delete -f <file.yaml>", description: "Delete resources defined in a YAML file" },
      { command: "kubectl get -f <file.yaml> -o yaml", description: "Check what a YAML file would create (dry-run)" },
      { command: "kubectl diff -f <file.yaml>", description: "Show diff between local YAML and current cluster state" },
      { command: "kubectl delete all --all", description: "⚠ Delete ALL resources in the current namespace" },
    ],
  },
];

export default function KubernetesCheatsheet() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Kubernetes Cheatsheet</h1>
        <p className="text-muted-foreground mt-1">
          Essential kubectl commands for managing clusters, pods, deployments, services, and more.
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
                      <th className="text-left p-3 font-medium w-[48%]">Command</th>
                      <th className="text-left p-3 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.commands.map((cmd, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="p-3 font-mono text-xs break-all text-primary">{cmd.command}</td>
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
