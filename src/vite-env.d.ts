
/// <reference types="vite/client" />

// Add function to check if column exists
declare global {
  interface Database {
    public: {
      Functions: {
        check_column_exists: (args: { table_name: string; column_name: string }) => boolean;
      };
    };
  }
}
