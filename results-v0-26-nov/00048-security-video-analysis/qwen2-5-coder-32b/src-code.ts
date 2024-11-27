import { localRustToolkitShinkaiSqliteQueryExecutor } from './shinkai-local-tools.ts';
import cv from 'npm:opencv4nodejs@7.6.0';

type CONFIG = {};
type INPUTS = { video_stream_url: string, sensitivity?: number };
type OUTPUT = { status: string };

export async function run(config: CONFIG, inputs: INPUTS): Promise<OUTPUT> {
    const videoStreamUrl = inputs.video_stream_url;
    const sensitivity = inputs.sensitivity || 50; // default sensitivity

    try {
        const cap = new cv.VideoCapture(videoStreamUrl);
        let previousFrame: cv.Mat | null = null;

        while (true) {
            const frame = cap.read();

            if (frame.empty) {
                break;
            }

            if (!previousFrame) {
                previousFrame = frame.cvtColor(cv.COLOR_BGR2GRAY).blur(new cv.Size(5, 5));
                continue;
            }

            const currentFrame = frame.cvtColor(cv.COLOR_BGR2GRAY).blur(new cv.Size(5, 5));
            const frameDelta = currentFrame.absdiff(previousFrame);
            const thresh = frameDelta.threshold(sensitivity, 255, cv.THRESH_BINARY);
            const dilatedThresh = thresh.dilate(cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(7, 7)));

            const contours = dilatedThresh.findContours(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

            for (const contour of contours) {
                if (contour.area < 500) continue; // Ignore small changes

                const boundingRect = contour.boundingRect();
                frame.drawRectangle(
                    new cv.Point(boundingRect.x, boundingRect.y),
                    new cv.Point(boundingRect.x + boundingRect.width, boundingRect.y + boundingRect.height),
                    new cv.Vec(0, 255, 0),
                    2
                );

                const timestamp = new Date().toISOString();
                const result = `Intruder detected at ${timestamp}`;
                await localRustToolkitShinkaiSqliteQueryExecutor(`INSERT INTO intrusions (result) VALUES (?)`, [result]);
            }

            previousFrame = currentFrame;
        }

        cap.release();

        return { status: 'Video analysis completed' };
    } catch (error) {
        console.error('Error processing video stream:', error);
        return { status: 'Failed to process video stream' };
    }
}