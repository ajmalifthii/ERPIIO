# Supabase Edge Functions (Deno)

The functions in this directory are Supabase Edge Functions and are written to be run with the **Deno runtime**. They are not directly compatible with the Node.js runtime.

## Running Functions Locally (Example)

To run a function locally for testing or development, use the Deno CLI. For example, to run the `complete-pos-sale` function:

```bash
deno run --allow-net --allow-env supabase/functions/complete-pos-sale/index.ts
```

Replace `complete-pos-sale/index.ts` with the path to the specific function you want to run.

**Flags:**
*   `--allow-net`: Allows the function to make network requests (e.g., to Supabase services).
*   `--allow-env`: Allows the function to access environment variables (e.g., for Supabase keys if you're managing them that way locally, though typically Supabase handles this in deployment).

## Development Environment

*   **VSCode:** If you are using Visual Studio Code, it is highly recommended to install the official Deno extension (`denoland.vscode-deno`) for proper type checking, import resolution, and debugging support. Ensure your VSCode workspace is configured to use Deno for this directory.
*   **Import Maps:** If your functions use import maps (typically `supabase/functions/import_map.json`), ensure Deno is configured to use it. This is often handled by the Supabase CLI when serving functions locally (e.g., `supabase functions serve`).

## Deployment

When deploying these functions via the Supabase CLI (`supabase functions deploy <function_name>`), Supabase handles the Deno environment automatically.

## "Module Not Found" Errors

If you encounter "Module Not Found" errors, it typically means:
1.  You are attempting to run a Deno function using a Node.js runtime.
2.  Your Deno environment is not correctly set up (e.g., VSCode Deno extension not enabled or misconfigured for the workspace).
3.  There's an issue with import paths or the import map if one is used.

Do not attempt to "fix" these errors by installing Node.js packages for Deno-specific URLs (like `https://deno.land/std/...`). This indicates a runtime mismatch. Ensure you are using Deno.
If you intend to run these functions in a Node.js environment, they would need to be rewritten using Node.js-compatible modules and patterns.
