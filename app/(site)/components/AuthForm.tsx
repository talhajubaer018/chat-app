'use client'

import AuthSocialButton from '@/app/(site)/components/AuthSocialButton'
import Button from '@/app/components/Button'
import Input from '@/app/components/inputs/Input'
import axios from 'axios'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { BsGithub, BsGoogle } from 'react-icons/bs'

const AuthForm = () => {
    const session = useSession()
    const router = useRouter()

    const [variant, setVariant] = useState<'LOGIN' | 'REGISTER'>('LOGIN')
    const [isLoading, setIsLoading] = useState(false)


    useEffect(() => {
        if (session?.status === 'authenticated') {
            router.push('/users')
        }
    }, [session?.status, router])


    const toggleVariant = useCallback(() => {
        if (variant === 'LOGIN') {
            setVariant('REGISTER');
        } else {
            setVariant('LOGIN');
        }
    }, [variant]);

    const { register, handleSubmit, formState: { errors } } = useForm<FieldValues>({
        defaultValues: {
            name: '',
            email: '',
            password: ''
        }
    })
    console.log('AuthForm - errors:', errors)

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        console.log('AuthForm - data:', data)
        setIsLoading(true)

        if (variant === 'REGISTER') {
            console.log('22222');

            axios.post('/api/register', data)
                .then(() => signIn('credentials', data))
                .catch(() => toast.error('Something went wrong!'))
                .finally(() => setIsLoading(false))
        }
        if (variant === 'LOGIN') {
            console.log('33333333');
            signIn('credentials', {
                ...data,
                redirect: false
            })
                .then((callback) => {
                    console.log('.then - callback:', callback)
                    if (callback?.error) {
                        toast.error('Invalid credentials!')
                    }

                    if (callback?.ok) {
                        toast.success('Login Successful')
                        router.push('/users')
                    }
                })
                .catch((err) => {
                    console.log('AuthForm - err:', err)
                    return toast.error(JSON.stringify(err))
                })
                .finally(() => setIsLoading(false))

        }
    }

    const socialAction = (action: string) => {
        setIsLoading(true);

        signIn(action, { redirect: false })
            .then((callback) => {
                if (callback?.error) {
                    toast.error('Invalid credentials!');
                }

                if (callback?.ok) {

                    toast.success('Login Successful');
                    //   router.push('/conversations')
                }
            })
            .finally(() => setIsLoading(false));
    }

    return (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
                <form
                    className="space-y-6"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    {variant === 'REGISTER' && (
                        <Input
                            disabled={isLoading}
                            register={register}
                            errors={errors}
                            required
                            id="name"
                            label="Name"
                            placeholder='Name'
                        />
                    )}
                    <Input
                        disabled={isLoading}
                        register={register}
                        errors={errors}
                        required
                        id="email"
                        type="email"
                        label="Email address"
                        placeholder='Email'
                    />
                    <Input
                        disabled={isLoading}
                        register={register}
                        errors={errors}
                        required
                        id="password"
                        type="password"
                        label="Password"
                        placeholder='Password'
                    />
                    <div>
                        <Button disabled={isLoading} fullWidth type="submit">
                            {variant === 'LOGIN' ? 'Sign in' : 'Register'}
                        </Button>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                        <AuthSocialButton
                            icon={BsGithub}
                            onClick={() => socialAction('github')}
                        />
                        <AuthSocialButton
                            icon={BsGoogle}
                            onClick={() => socialAction('google')}
                        />
                    </div>
                </div>
                <div className="flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500">
                    <div>
                        {variant === 'LOGIN' ? 'New to Messenger?' : 'Already have an account?'}
                    </div>
                    <div
                        onClick={toggleVariant}
                        className="underline cursor-pointer"
                    >
                        {variant === 'LOGIN' ? 'Create an account' : 'Login'}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthForm