"use client";

import React from "react";
import Button from "../ui/button";
import { Loader2 } from "lucide-react";
import User from "./user";
import useUsers from "@/hooks/useUsers";
import { IUser } from "@/types";
import Link from "next/link";

const FollowBar = () => {
  const { isLoading, users } = useUsers(5);

  return (
    <div className="py-4 hidden lg:block w-[266px]">
      <div className="bg-neutral-800 rounded-xl pb-2">
        <div className="flex-row items-center justify-center px-4 pt-4">
          <h2 className="text-white text-center text-xl font-semibold">Personnes à suivre</h2>

        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-24">
            <Loader2 className="animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="flex flex-col mt-4">
            {users.map((user: IUser) => (
              <Link key={user._id} href={`/profile/${user._id}`}>
                <User user={user} />
              </Link>
            ))}
          </div>
        )}
          <Link href="/explore">
            <Button
              secondary
              label={"Voir plus"}
              classNames="h-[30px] w-70 p-0 px-3 text-sm mx-auto mt-2"
            />
          </Link>
      </div>
    </div>
  );
};

export default FollowBar;
