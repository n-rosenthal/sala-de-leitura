"use client";

import { Bell, Search, User } from "lucide-react";
import { useState } from "react";
import { Avatar, Badge, Input } from "@heroui/react"; // Example using HeroUI components

export function TopHeader({ userName }: { userName?: string }) {
  const [notifications] = useState(3); // Example count

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Page Title & Breadcrumbs */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600">
          Bem-vindo, {userName || "Usuário"}
        </p>
      </div>

      {/* Right Section: Search, Notifications, User */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <Input
          aria-label="Search"
          classNames={{
            input: "text-sm",
          }}
          labelPlacement="outside"
          placeholder="Pesquisar..."
          startContent={<Search size={18} className="text-gray-400" />}
          type="search"
        />

        {/* Notifications */}
        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={20} />
          {notifications > 0 && (
            <Badge
              className="absolute -top-1 -right-1 px-1 min-w-5 h-5 text-xs"
              color="danger"
              variant="solid"
            >
              {notifications}
            </Badge>
          )}
        </button>

        {/* User Dropdown[citation:4] */}
        <div className="relative">
          <button className="flex items-center gap-3 p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <Avatar
              name={userName}
              size="sm"
              classNames={{
                base: "bg-gradient-to-br from-blue-500 to-purple-500",
                name: "text-white font-semibold",
              }}
            />
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-gray-500">Gerente</p>
            </div>
          </button>
          {/* Dropdown menu would go here */}
        </div>
      </div>
    </div>
  );
}