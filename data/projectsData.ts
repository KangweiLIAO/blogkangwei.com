interface Project {
    title: string
    description: string
    href?: string
    imgSrc?: string
}

const projectsData: Project[] = [
    {
        title: 'sCode Chatbot',
        description: `An AI-powered chatbot designed to assist developers with coding tasks by providing code snippets, debugging tips, and programming explanations. 
    Built with NextJS, FastAPI, and Dialogflow, it offers a seamless experience through deployments on Heroku and Vercel.`,
        imgSrc: '/static/images/scode.png',
        href: 'https://github.com/KangweiLIAO/sCode-chatbot',
    },
    {
        title: 'Flow Dataset',
        description: `The Flow Dataset project leveraging the Kubric framework, this project improves how dynamic, multi-object 
    scenes are generated for optical flow algorithms, making significant advancements in simulating complex, realistic environments.`,
        imgSrc: '/static/images/banner.png',
        href: '/blog/flow-dataset',
    },
]

export default projectsData
