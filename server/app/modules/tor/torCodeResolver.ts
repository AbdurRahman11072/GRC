import { prisma } from '../../../lib/prisma';

/**
 * Resolves the next sequential ToR code for a given project and parent node.
 * If parentId is provided: yields e.g. "1.1", "1.2", "2.1"
 * If root: yields e.g. "1", "2", "3"
 */
export async function resolveNextTorCode(
  projectId: string,
  parentId?: string | null
): Promise<string> {
  if (parentId) {
    const parentTor = await prisma.tor.findFirst({
      where: { id: parentId, projectId },
      include: { children: { select: { code: true } } },
    });
    if (!parentTor) return '1.1';

    const parentCode = parentTor.code.trim();
    const parentBase = parentCode.endsWith('.0') ? parentCode.slice(0, -2) : parentCode;
    const prefix = `${parentBase}.`;
    let maxChildIndex = 0;

    parentTor.children.forEach((c) => {
      if (c.code.startsWith(prefix)) {
        const remainder = c.code.slice(prefix.length).split('.')[0];
        const parsed = parseInt(remainder, 10);
        if (!isNaN(parsed) && parsed > maxChildIndex) maxChildIndex = parsed;
      } else {
        const parts = c.code.split('.');
        const last = parts[parts.length - 1];
        const parsed = parseInt(last, 10);
        if (!isNaN(parsed) && parsed > maxChildIndex) maxChildIndex = parsed;
      }
    });

    return `${parentBase}.${maxChildIndex + 1}`;
  }

  const rootTors = await prisma.tor.findMany({
    where: { projectId, parentId: null },
    select: { code: true },
  });

  let maxNum = 0;
  rootTors.forEach((n) => {
    const num = parseInt(n.code, 10);
    if (!isNaN(num) && num > maxNum) maxNum = num;
  });

  return String(maxNum > 0 ? maxNum + 1 : rootTors.length + 1);
}
