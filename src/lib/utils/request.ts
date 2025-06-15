import { type User } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";

export function getUserFromRequest(request: NextRequest) {
  return {
    id: request.headers.get("x-user-id")!,
    email: request.headers.get("x-user-email")!,
    role: request.headers.get("x-user-role")!,
    organizationId: request.headers.get("x-organization-id")!,
  };
}

export function setUserInRequest(
  request: NextRequest,
  user: User,
  organizationId: string
) {
  request.headers.set("x-user-id", user.id ?? "");
  request.headers.set("x-user-email", user.email ?? "");
  request.headers.set("x-user-role", user.role ?? "");
  request.headers.set("x-organization-id", organizationId ?? user.id);

  return request;
}
