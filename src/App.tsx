import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./contexts/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Marketplace from "./pages/Marketplace";
import Wallet from "./pages/Wallet";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import { HelmetProvider } from 'react-helmet-async';
import EnhancedFeed from "./pages/EnhancedFeed";
import Community from "./pages/Community";

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AuthProvider>
    </HelmetProvider>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AppLayout>
        <Home />
      </AppLayout>
    ),
  },
  {
    path: "/feed",
    element: (
      <AppLayout>
        <EnhancedFeed />
      </AppLayout>
    ),
  },
  {
    path: "/profile/:username",
    element: (
      <AppLayout>
        <Profile />
      </AppLayout>
    ),
  },
  {
    path: "/settings",
    element: (
      <AppLayout>
        <Settings />
      </AppLayout>
    ),
  },
  {
    path: "/marketplace",
    element: (
      <AppLayout>
        <Marketplace />
      </AppLayout>
    ),
  },
  {
    path: "/wallet",
    element: (
      <AppLayout>
        <Wallet />
      </AppLayout>
    ),
  },
  {
    path: "/notifications",
    element: (
      <AppLayout>
        <Notifications />
      </AppLayout>
    ),
  },
  {
    path: "/messages",
    element: (
      <AppLayout>
        <Messages />
      </AppLayout>
    ),
  },
  {
    path: "/community",
    element: (
      <AppLayout>
        <Community />
      </AppLayout>
    ),
  },
]);

export default App;
