import { Route, Routes } from 'react-router-dom';
import { Layout } from '@components';
import { LoginPage, DashboardPage, ResponseStatistics } from '@pages';
import { RequireAuth } from '@components';
import { Roles } from '@interfaces';
import AuthSuccess from '@components/AuthSuccess/AuthSuccess.tsx';
import AddQuestionPage from './pages/add-question/AddQuestionPage';
import EditQuestionPage from './pages/edit-question/EditQuestionPage';
import PlayerScreenPage from './pages/player-screen/PlayerScreenPage';
import QuestionStatisticsPage from './pages/question-statistics-page/QuestionStatisticsPage';
import EditQuizPage from './pages/edit-quiz/EditQuizPage';
import AllowedEmailPage from '@pages/allowed-email/AllowedEmail.tsx';
import { MailMessagePage } from '@pages/mail-message/mail-message.page.tsx';

import 'reactjs-tiptap-editor/style.css';

function App() {
    return (
        <div className="app">
            <Routes>
                <Route path="/" element={<Layout />}>
                    {/* default */}
                    <Route path="login" element={<LoginPage />} />
                    {/*<Route path="register" element={<RegisterPage />} />*/}
                    <Route path="auth/success" element={<AuthSuccess />} />
                    <Route path="session/:sessionId" element={<PlayerScreenPage />} />

                    {/* for admin or authorized user */}
                    <Route
                        element={<RequireAuth allowedRoles={[Roles.USER, Roles.ADMIN]} />}
                    >
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="quiz/:quizId/question" element={<AddQuestionPage />} />
                        <Route path="quiz/:quizId/edit" element={<EditQuizPage />} />
                        <Route
                            path="quiz/:quizId/question/:questionId"
                            element={<EditQuestionPage />}
                        />
                        <Route
                            path="quiz/:quizId/question/statistics"
                            element={<QuestionStatisticsPage />}
                        />
                        <Route
                            path="quiz/:quizId/allowed-emails"
                            element={<AllowedEmailPage />}
                        />

                        <Route
                            path="mail-message"
                            element={<MailMessagePage />}
                        />

                        <Route
                            path="session/:sessionId/statistics"
                            element={<ResponseStatistics />}
                        />
                    </Route>
                </Route>
            </Routes>
        </div>
    );
}

export default App;
