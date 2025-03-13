"use client";

import React from "react";
import Button from "../ui/button";
import { Loader2 } from "lucide-react";
import User from "./user";
import useUsers from "@/hooks/useUsers";
import { IUser } from "@/types";
import Link from "next/link";
import { motion } from "framer-motion";

const FollowBar = () => {
  const { isLoading, users } = useUsers(5);

  return (
    <div className="py-4 hidden lg:block w-[280px]">
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-[#181818] rounded-xl border border-neutral-700 shadow-lg shadow-black/20 p-4"
      >
        
        <h2 className="text-white text-center text-lg font-semibold pb-2">
          Personnes à suivre
          <div className="mt-1 mx-auto w-8 h-[2px] bg-orange-500 rounded-full"/>
        </h2>

        {isLoading ? (
          <div className="flex justify-center items-center h-24">
            <motion.div 
              animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Loader2 className="text-orange-500" />
            </motion.div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mt-4">
            {users.map((user: IUser, index: number) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  href={`/profile/${user._id}`}
                  className="rounded-lg hover:bg-neutral-700/30 transition-colors"
                >
                  <User user={user} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <Link href="/explore">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              label={"Voir plus"}
              classNames="
                text-xs font-medium
                border border-orange-500 text-orange-500
                bg-transparent hover:bg-orange-500 hover:text-white
                transition-colors duration-200
                px-4 py-1 rounded-full
                mx-auto mt-4
              "
            />
          </motion.div>
        </Link>

      </motion.div>
    </div>
  );
};

export default FollowBar;
