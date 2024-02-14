import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@src/services/api/baseQuery.ts";
import { IPagination, IQuiz, QuizStatus } from "@interfaces";
import { Session } from "@src/interfaces/session";

interface UserList {
  count: number;
  users: User[];
}

interface User {
  id: string;
  email: string;
  updatedAt: string;
  roles: string[];
  responseId: string;
}

export const quizApi = createApi({
  reducerPath: "quizApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getAllQuiz: builder.query<
      IPagination<IQuiz>,
      {
        page?: number;
        perPage?: number;
        search?: string;
        status?: QuizStatus | null;
      }
    >({
      query: ({ page = 1, perPage = 10, search = "", status = null }) => ({
        // Use `status` here instead of `quizStatus`
        url: `/quiz?page=${page}&perPage=${perPage}&search=${search}&status=${status}`,
        method: "GET",
      }),
    }),

    createQuiz: builder.mutation<IQuiz, { title: string; description: string; status?: string; tags: string[] }>({
      query: ({ title, description, tags, status }) => ({
        url: `/quiz`,
        method: "POST",
        body: {
          title: title,
          description: description,
          tags: tags,
          status: status,
        },
      }),
    }),

    getQuizById: builder.query<IQuiz, string>({
      query: (id: string) => ({
        url: `/quiz/${id}`,
        method: "GET",
      }),
    }),

    getQuizByToken: builder.query<IQuiz, string>({
      query: (token: string) => ({
        url: `/quiz?token=${token}`,
        method: "GET",
      }),
    }),

    deleteQuizById: builder.mutation<void, string>({
      query: (id: string) => ({
        url: `/quiz/${id}`,
        method: "DELETE",
      }),
    }),

    updateQuiz: builder.mutation<IQuiz, {
        id: string;
        title: string;
        description: string;
        status: string;
        tags: string[];
      }
    >({
      query: ({ id, title, tags, status, description }) => ({
        url: `quiz/${id}`,
        method: "PATCH",
        body: { title, description, tags, status },
      }),
    }),

    getStatistics: builder.query<UserList, string>({
      query: (quizId: string) => ({
        url: `quiz/${quizId}/stats`,
        method: "GET",
      }),
    }),

    getSession: builder.query<Session, string>({
      query: (sessionId) => `sessions/${sessionId}`,
    }),

    createSession: builder.mutation<void, { email: string; quizId: string }>({
      query: ({ email, quizId }) => ({
        url: 'sessions',
        method: 'POST',
        body: { email, quizId },
      }),
    }),
    
    submitAnswer: builder.mutation<void, { sessionId: string; questionId: string; answerId: string }>({
      query: ({ sessionId, questionId, answerId }) => ({
        url: `sessions/${sessionId}/submit-answer`,
        method: 'POST',
        body: { questionId, answerId },
      }),
    }),

    startQuiz: builder.mutation<void, { quizSessionId: string }>({
      query: (quizSessionId) => ({
        url: `sessions/${quizSessionId}/start`,
        method: 'POST',
      }),
    }),

    
    
    endQuiz: builder.mutation<{ quizSessionId: string }, string>({
      query: (quizSessionId) => ({
        url: `sessions/${quizSessionId}/end`,
        method: 'POST',
      }),
    }),

    sendVerificationCode: builder.mutation<void, { quizId: string; email: string }>({
      query: ({ quizId, email }) => ({
        url: `quiz/${quizId}/send-verification-code`,
        method: "POST",
        body: { email, quizId }
      })
    }),

    verifyCode: builder.query<void, { code: string, email: string, quizId: string }>({
      query: ({ code, email, quizId }) => ({
        url: `quiz/${quizId}/verify-code`,
        method: "GET",
        params: { email, code }
      }),
    }),
  }),
});

export const {
  useGetAllQuizQuery,
  useGetQuizByIdQuery,
  useCreateQuizMutation,
  useDeleteQuizByIdMutation,
  useUpdateQuizMutation,
  useGetStatisticsQuery,
  useGetSessionQuery,
  useCreateSessionMutation,
  useSubmitAnswerMutation,
  useStartQuizMutation,
  useEndQuizMutation,
  useSendVerificationCodeMutation,
  useVerifyCodeQuery
} = quizApi;
