interface Project {
  title: string,
  description: string,
  href?: string,
  imgSrc?: string,
}

const projectsData: Project[] = [
  {
    title: 'sCode Chatbot',
    description: `An AI-powered chatbot designed to assist developers with coding tasks by providing code snippets, debugging tips, and programming explanations. 
    Built with NextJS, FastAPI, and Dialogflow, it offers a seamless experience through deployments on Heroku and Vercel.`,
    imgSrc: '/static/images/scode.png',
    href: 'https://scode-chatbot.vercel.app/',
  },
]

export default projectsData
