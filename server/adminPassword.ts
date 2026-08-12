import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { ENV } from "./_core/env";
import { getSessionCookieOptions } from "./_core/cookies";

export const ADMIN_PASSWORD_COOKIE = "healing_admin_password_verified";
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

function parseCookie(req: Request, name: string) { return req.headers.cookie?.split(";").map(value => value.trim()).find(value => value.startsWith(`${name}=`))?.slice(name.length + 1); }
function sign(payload: string) { return createHmac("sha256", ENV.cookieSecret).update(payload).digest("hex"); }

export function verifyAdministratorPassword(value: string) {
  const expected = ENV.adminAccessPassword;
  const provided = Buffer.from(value);
  const target = Buffer.from(expected);
  return Boolean(expected) && provided.length === target.length && timingSafeEqual(provided, target);
}

export function issueAdministratorPasswordSession(req: Request, res: Response, openId: string) {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payload = `${openId}.${expiresAt}`;
  res.cookie(ADMIN_PASSWORD_COOKIE, `${payload}.${sign(payload)}`, { ...getSessionCookieOptions(req), maxAge: SESSION_DURATION_MS });
}

export function hasAdministratorPasswordSession(req: Request, openId: string) {
  const token = parseCookie(req, ADMIN_PASSWORD_COOKIE);
  if (!token) return false;
  const [tokenOpenId, expiresAtText, signature] = token.split(".");
  const expiresAt = Number(expiresAtText);
  if (tokenOpenId !== openId || !Number.isFinite(expiresAt) || expiresAt <= Date.now() || !signature) return false;
  const expected = sign(`${tokenOpenId}.${expiresAtText}`);
  const actual = Buffer.from(signature);
  const target = Buffer.from(expected);
  return actual.length === target.length && timingSafeEqual(actual, target);
}
