import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { conf } from "src/config";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>("roles", context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const role = request.user.role;
    return this.matchRoles(roles, role);
  }

  matchRoles(roles: string[], authenticatedUserROle: string) {
    return roles.some(
      (role) => role === conf.ROLE_KEY.concat(authenticatedUserROle, ""),
    );
  }
}
