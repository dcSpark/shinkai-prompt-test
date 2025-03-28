// Limit requests per IP
// Max LIMIT requests per WINDOW per IP
import { exists } from "jsr:@std/fs/exists";
export class IPLimits {
    private static window = 60 * 60 * 1000; // 60 minute(s)
    private static limit = 200;
    static async init() {
        await Deno.mkdir(Deno.cwd() + '/cache/ips', { recursive: true });
    }

    private static file(ip: string) {
        return Deno.cwd() + `/cache/ips/${ip}`;
    }

    public static async requestSlot(ip: string): Promise<{ allowed: boolean, remaining: number, nextAllowed: number }> {
        const hasData = await exists(IPLimits.file(ip));
        if (!hasData) {
            await Deno.writeTextFile(IPLimits.file(ip), JSON.stringify([Date.now()]));
            return { allowed: true, remaining: IPLimits.limit, nextAllowed: 0 };
        } else {
            const file = await Deno.readTextFile(IPLimits.file(ip));
            const data: number[] = JSON.parse(file);
            const keep = data.filter(timestamp => timestamp > Date.now() - IPLimits.window);
            if (keep.length < IPLimits.limit) {
                await Deno.writeTextFile(this.file(ip), JSON.stringify([...keep, Date.now()]));
                return { allowed: true, remaining: IPLimits.limit - keep.length, nextAllowed: 0 };
            } else {
                console.log('[ERROR] Rate limit exceeded @', ip);
                const nextAllowed = (Math.abs((keep[0] + IPLimits.window) - Date.now()) / 1000) | 0;
                return { allowed: false, remaining: 0, nextAllowed };
            }
        }
    }
}

IPLimits.init();