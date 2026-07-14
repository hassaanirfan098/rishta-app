/** Brand-illustrated fallback avatar for profiles without a photo. */
export function fallbackAvatar(gender?: string | null): string {
  return gender === "male" ? "/avatars/male.jpg" : "/avatars/female.jpg";
}
