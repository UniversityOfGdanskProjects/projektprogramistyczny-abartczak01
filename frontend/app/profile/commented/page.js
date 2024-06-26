"use client";
import React, { useContext, useLayoutEffect, useState } from "react";
import { UserContext } from "@/context/userContextProvider";
import MovieList from "@/components/MovieList";
import LoadingPage from "@/components/LoadingPage";

export default function CommentedPage() {
  const { user } = useContext(UserContext);
  const [commentedMovies, setCommentedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useLayoutEffect(() => {
    const fetchCommentedList = async (userId) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}commented/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setCommentedMovies(data.movies);
          setIsLoading(false);
        } else {
          console.error("Failed to fetch data. Status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };
    if (user) {
      fetchCommentedList(user.id);
    }
  }, []);

  return !isLoading ? (
    <section className="users-list-page">
      <h1>Commented Movies</h1>
      <p>You have commented on {commentedMovies.length} movies</p>
      <MovieList movies={commentedMovies} isPersonal={true} />
    </section>
  ) : (
    <LoadingPage />
  );
}
