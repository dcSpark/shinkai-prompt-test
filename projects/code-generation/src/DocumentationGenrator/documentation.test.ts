import { assert } from "https://deno.land/std@0.208.0/assert/assert.ts";
import {
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import "jsr:@std/dotenv/load";
import { getModelSmall } from "../Engines/index.ts";
import { FileManager } from "../ShinkaiPipeline/FileManager.ts";
import { DependencyDoc } from "./index.ts";

Deno.test(
  "DependencyDoc.getDependencyDocumentation - basic functionality",
  async () => {
    // Arrange
    const engine = getModelSmall();
    const logger = new FileManager("typescript", "test", true);
    const dependencyDoc = new DependencyDoc(engine, logger);

    // Act
    const result = await dependencyDoc.getDependencyDocumentation(
      "axios",
      "typescript"
    );
    // console.log(result);
    assertExists(result, "Documentation should not be null or undefined");
    assertEquals(typeof result, "string", "Documentation should be a string");

    assert(result.includes("axios"), "Documentation should contain 'axios'");
    assert(result.includes("get"), "Documentation should contain 'get'");
    assert(result.includes("post"), "Documentation should contain 'post'");
    assert(
      result.includes("application/json"),
      "Documentation should contain 'application/json'"
    );
    assert(
      result.includes("application/x-www-form-urlencoded"),
      "Documentation should contain 'application/x-www-form-urlencoded'"
    );
    assert(
      result.includes("multipart/form-data"),
      "Documentation should contain 'multipart/form-data'"
    );
    // assert(result.includes('Authorization'), "Documentation should contain 'Authorization'");
    assert(
      result.includes("headers"),
      "Documentation should contain 'headers'"
    );
    assert(result.includes("data"), "Documentation should contain 'data'");
    assert(result.includes("params"), "Documentation should contain 'params'");
    assert(result.includes("url"), "Documentation should contain 'url'");
    assert(
      result.includes("npm install axios"),
      "Documentation should contain 'npm install axios'"
    );
    assert(
      result.match(/import axios from ['"]axios['"]/),
      "Documentation should contain 'import axios from 'axios''"
    );
  }
);
