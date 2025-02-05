import { Button } from '@/components/Button'
import { Github, Linkedin, FileText } from 'lucide-react'
import Link from '@/components/Link'
import { InteractiveDots } from '@/components/InteractiveDots'
import siteMetadata from '@/data/siteMetadata'
import { ContentCard } from '@/components/ContentCard'

export default function Home() {
  return (
    <div className="from-background to-background/95 relative min-h-[75vh] overflow-hidden bg-gradient-to-b">
      {/* Interactive dot pattern background */}
      <div className="absolute inset-0 h-full w-full" aria-hidden="true">
        <InteractiveDots />
      </div>

      {/* Main content */}
      <main className="md:item-start container relative z-10 flex min-h-[75vh] items-center px-4 py-8 md:items-start md:py-12 lg:px-8">
        <ContentCard className="mx-auto max-w-[720px] lg:ml-[30px] lg:mt-[30px]">
          <div className="space-y-6">
            <h1 className="space-y-4">
              <span className="text-muted-foreground block text-base font-medium sm:text-lg">
                Hi, I am
              </span>
              <span className="block text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                {siteMetadata.author}
              </span>
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl">{siteMetadata.description}</p>
            <div className="flex flex-wrap gap-3 pt-4 sm:gap-4">
              <Button variant="rounded" size="rounded" asChild>
                <Link
                  href="https://drive.google.com/file/d/1BvngGIHgbMQxBo4x-v0U_9htVnJ4dlpV/view?usp=sharing"
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Resume
                </Link>
              </Button>
              <Button variant="rounded" size="rounded" asChild>
                <Link
                  href={siteMetadata.github || '#'}
                  className="gap-2"
                  aria-label="GitHub Profile"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </Link>
              </Button>
              <Button variant="rounded" size="rounded" asChild>
                <Link
                  href={siteMetadata.linkedin || '#'}
                  className="gap-2"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Link>
              </Button>
            </div>
          </div>
        </ContentCard>
      </main>
    </div>
  )
}
