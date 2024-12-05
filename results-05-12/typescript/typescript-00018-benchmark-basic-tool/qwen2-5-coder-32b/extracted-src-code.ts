import { shinkaiFoobar } from './shinkai-local-tools.ts';

type CONFIG = {};
type INPUTS = {};
type OUTPUT = {
  message: string;
};

export async function run(config: CONFIG, inputs: INPUTS): Promise<OUTPUT> {
    const response = await shinkaiFoobar("Sample message for foobar tool");
    return {
        message: response.message
    };
}