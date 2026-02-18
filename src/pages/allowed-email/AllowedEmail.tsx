import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    useCreateSessionMutation,
    useDeleteSessionMutation,
    useGetAllSessionsQuery, useMailMessages,
    useSendCustomSessionToEmailMutation,
} from '@store/api';
import { UIField, UITitle } from '@components/Base UI';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Loader, Pagination } from '@components';
import './AllowedEmail.css';
import { SessionStatus } from '@interfaces';

const AllowedEmailPage = () => {
    const { quizId } = useParams() as { quizId: string };
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStatus, setSelectedStatus] = useState<SessionStatus | null>(
        null,
    );

    const [createSession, { isLoading: isCreating }] = useCreateSessionMutation();
    const [sendCustomSession, { isLoading: isCustomSending }] =
        useSendCustomSessionToEmailMutation();
    const [deleteSession, { isLoading: isDeleting }] = useDeleteSessionMutation();
    const {
        data: sessions,
        isLoading: isSessionsLoading,
        refetch,
    } = useGetAllSessionsQuery({
        page: currentPage,
        status: selectedStatus,
        quizId,
    });

    const { data: mailMessages } = useMailMessages({ quizId });

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setEmail(e.target.value);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleCreate = async () => {
        if (email) {
            if (!validateEmail(email)) {
                toast.error('Please, enter a valid email.');
                return;
            }
            try {
                if (sessions?.data.find((session) => session.email?.email === email)) {
                    toast.error('This email is already exists.');
                    return;
                }

                await createSession({ quizId, email });
                toast.success('Session was created successfully.');
                setEmail('');
                refetch(); // Обновить список после добавления
            } catch (error) {
                console.error('Error creating session:', error);
                toast.error('Error creating session.');
            }
        } else {
            toast.error('Please, enter a email.');
        }
    };

    const sendCustomSessionToEmail = async ({ sessionId, mailMessageId }: {
        sessionId: string,
        mailMessageId: string
    }) => {
        try {
            await sendCustomSession({ sessionId, mailMessageId });
            toast.success('Session was sended successfully.');
            refetch();
        } catch (error) {
            console.error('Error sending session:', error);
            toast.error('Error sending session.');
        }
    };

    const handleDelete = async (sessionId: string) => {
        try {
            await deleteSession(sessionId);
            toast.success('Session was deleted successfully.');
            refetch();
        } catch (error) {
            console.error('Error deleting session:', error);
            toast.error('Error deleting session.');
        }
    };
    const onPageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = event.target;
        if (value === 'All') {
            setSelectedStatus(null);
        } else {
            setSelectedStatus(value as SessionStatus);
        }
    };

    const handleCopyToClipboard = async (sessionLink: string) => {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(sessionLink);
        } else {
            fallbackCopy(sessionLink);
        }
    };

    const fallbackCopy = (text: string) => {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand("copy");
            alert("Скопировано!");
        } catch (err) {
            console.error("Fallback: Copy failed", err);
        }
        document.body.removeChild(textarea);
    };

    if (
        isCreating ||
        isSessionsLoading ||
        isDeleting ||
        isCustomSending
    )
        return <Loader />;

    return (
        <div className="allowed-email page">
            <div className="back" onClick={() => navigate(-1)}>
                Back
            </div>
            <UITitle title="Session" subtitle="Create a session for a user" />
            <Link to={`/mail-message?quizId=${quizId}`} className="create-mail__button">
                Create mail message
            </Link>
            <div className="allowed-email__create">
                <UIField
                    id={`email-${quizId}`}
                    inputProps={{
                        value: email,
                        onChange: handleEmailChange,
                        type: 'email',
                    }}
                    label="Email"
                />
                <button onClick={handleCreate} className="allowed-email__button">
                    Create
                </button>
                <div className="allowed-email__select">
                    <select className="select-custom" onChange={handleStatusChange}>
                        <option value="All">All</option>
                        <option value={SessionStatus.COMPLETED}>Completed</option>
                        <option value={SessionStatus.MAIL_SENDED}>Mail sent</option>
                        <option value={SessionStatus.NOT_STARTED}>Not Started</option>
                        <option value={SessionStatus.IN_PROGRESS}>In Progress</option>
                    </select>
                </div>
            </div>
            {sessions && sessions.data.length > 0 ? (
                <div className="allowed-email__table">
                    <table>
                        <thead>
                        <tr>
                            <td className="user">
                                <span>Email</span> <span>Status</span>
                                <span>Delete</span>
                            </td>
                        </tr>
                        </thead>
                        <tbody>
                        {sessions.data?.map((session) => (
                            <tr key={session.id}>
                                <td className="user">
                                    {session.status === 'COMPLETED' ? (
                                        <Link to={`/session/${session.id}/statistics`}>
                                            {session?.email?.email}
                                        </Link>
                                    ) : (
                                        <>
                                            <span>{session?.email?.email}</span>
                                        </>
                                    )}
                                    {(session.status === 'COMPLETED' && 'Completed') ||
                                        (session.status === 'NOT_STARTED' && 'Not Started') ||
                                        (session.status === 'IN_PROGRESS' && 'In Progress') ||
                                        (session.status === 'MAIL_SENDED' && 'Mail Sent')}
                                    <div className="allowed-email__actions">
                                        {(session.status === 'NOT_STARTED' ||
                                            session.status === 'MAIL_SENDED') && (
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <button
                                                    className="allowed-email__action send"
                                                    onClick={() => handleCopyToClipboard(`http://kmgasurvey.kz/session/${session.id}`)}
                                                >
                                                    Copy link
                                                </button>
                                            </div>
                                        )}
                                        {(session.status === 'NOT_STARTED' ||
                                                session.status === 'MAIL_SENDED') &&
                                            mailMessages?.map(mailMessage => (
                                                <div style={{ border: '1px green solid', padding: 6 }}>
                                                    <p
                                                        style={{
                                                            fontSize: 12,
                                                            marginTop: 6,
                                                        }}
                                                    >
                                                        {mailMessage.title}
                                                    </p>
                                                    <Link
                                                        style={{
                                                            fontSize: 12,
                                                            backgroundColor: 'var(--se-life-green)',
                                                            padding: 6,
                                                            color: 'white',
                                                            borderRadius: 12,
                                                            marginTop: 6,
                                                        }}
                                                        to={`/mail-message?quizId=${quizId}&mailMessageId=${mailMessage.id}`}
                                                    >
                                                        Update
                                                    </Link>
                                                    <button
                                                        style={{
                                                            fontSize: 12,
                                                            backgroundColor: 'var(--se-life-green)',
                                                            padding: 6,
                                                            color: 'white',
                                                            borderRadius: 12,
                                                            marginTop: 6,
                                                        }}
                                                        onClick={() => sendCustomSessionToEmail({
                                                            sessionId: session.id,
                                                            mailMessageId: mailMessage.id,
                                                        })}
                                                    >
                                                        Send
                                                    </button>
                                                </div>
                                            ))}
                                        <button
                                            className="allowed-email__action delete"
                                            onClick={() => handleDelete(session.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <h3 className="allowed-email__empty">No sessions</h3>
            )}
            {sessions && <p>Count: {sessions.meta.total}</p>}
            {sessions && (
                <Pagination
                    meta={sessions.meta}
                    visiblePages={10}
                    onPageChange={onPageChange}
                />
            )}
        </div>
    );
};

export default AllowedEmailPage;
