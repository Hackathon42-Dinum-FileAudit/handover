"use client";
import { useState } from "react";

// UI-kit Components
import { Footer } from "@gouvfr-lasuite/ui-components";
import { Header } from "@gouvfr-lasuite/ui-components";
import { Select } from "@gouvfr-lasuite/ui-components";
import { Button } from "@gouvfr-lasuite/ui-components";
import {
  TreeProvider,
  TreeView,
  TreeViewItem,
  TreeViewNodeTypeEnum,
} from "@gouvfr-lasuite/ui-components";
import { Checkbox } from "@gouvfr-lasuite/ui-components";

// UI-kit Icons
import { ArrowLeftRight } from "@gouvfr-lasuite/ui-components/icons";
import { Trash } from "@gouvfr-lasuite/ui-components/icons";
import { Undo } from "@gouvfr-lasuite/ui-components/icons";
import { Retry } from "@gouvfr-lasuite/ui-components/icons";
import { Send } from "@gouvfr-lasuite/ui-components/icons";


// Data
const data = [
  {
    id: "1",
    nodeType: TreeViewNodeTypeEnum.NODE,
    label: "Dossier A",
    childrenCount: 2,
    children: [
      { id: "1-1", nodeType: TreeViewNodeTypeEnum.NODE, label: "Sous-dossier 1" },
      { id: "1-2", nodeType: TreeViewNodeTypeEnum.NODE, label: "Sous-dossier 2" },
    ],
  },
  { id: "2", nodeType: TreeViewNodeTypeEnum.NODE, label: "Dossier B" },
];

// Functions
function DeleteButton() {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <Button
      aria-label={confirmed ? "Confirmed" : "Delete"}
      icon={confirmed ? <Undo /> : <Trash />}
      variant="primary"
      color={confirmed ? "success" : "error"}
      onClick={() => setConfirmed(!confirmed)}
    />
  );
}


function Node(props: any) {
  const { node, style, dragHandle } = props;
  return (
    <TreeViewItem {...props}>
      <div className="flex items-center justify-between w-full pr-2 group">
        <Checkbox></Checkbox>
        <span>{node.data.value.label}</span>
        <Select
            label="Select target user"
            options={[
              {
                label: 'Sophie Vigier',
                value: 'sophie-vigier'
              },
              {
                label: 'Grégoire Martinez',
                value: 'gregoire-martinez'
              },
              {
                label: 'Monsieur Blackhole',
                value: 'monsieur-blackhole'
              }
            ]}
            searchable
          />
          <DeleteButton/>
      </div>
    </TreeViewItem>
  );
}


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans dark:bg-black">

      <Header
        leftIcon={<span className="font-semibold text-lg">Offboarding</span>}
        isPanelOpen={false}
        onTogglePanel={() => {}}
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 sm:px-8 sm:py-16">
        <div>
          <Select
            defaultValue="monsieur-blackhole"
            label="Select leaving user"
            options={[
              {
                label: 'Sophie Vigier',
                value: 'sophie-vigier'
              },
              {
                label: 'Grégoire Martinez',
                value: 'gregoire-martinez'
              },
              {
                label: 'Monsieur Blackhole',
                value: 'monsieur-blackhole'
              }
            ]}
            searchable
          />

          <Select
            label="Select target user"
            options={[
              {
                label: 'Sophie Vigier',
                value: 'sophie-vigier'
              },
              {
                label: 'Grégoire Martinez',
                value: 'gregoire-martinez'
              },
              {
                label: 'Monsieur Blackhole',
                value: 'monsieur-blackhole'
              }
            ]}
            searchable
          />
          <Button
            icon={<ArrowLeftRight />}
            variant="primary"
          >
            Transfert All
          </Button>
          <Button
            icon={<Retry />}
            variant="primary"
            color="warning"
          >
            Reset
          </Button>
          <Button
            icon={<Send />}
            variant="primary"
            color="success"
          >
            Send
          </Button>
          <div>
            <TreeProvider initialTreeData={data as any}>
              <TreeView
                rootNodeId=""
                selectedNodeId=""
                renderNode={Node}
              />
            </TreeProvider>
          </div>
        </div>
      </main>

      <Footer
        externalLinks={[
          { href: "https://legifrance.gouv.fr/", label: "legifrance.gouv.fr" },
          { href: "https://info.gouv.fr/", label: "info.gouv.fr" },
          { href: "https://service-public.fr/", label: "service-public.fr" },
          { href: "https://data.gouv.fr/", label: "data.gouv.fr" },
        ]}
        legalLinks={[
          { href: "/legal-notice", label: "Legal Mentions" },
          { href: "/personal-data-cookies", label: "Personal Data and cookies" },
          { href: "/accessibility", label: "Accessibility: non-compliant" },
        ]}
        license={{
          label: "Unless otherwise stated, all content on this site is under",
          link: {
            href: "https://github.com/etalab/licence-ouverte/blob/master/LO.md",
            label: "licence etalab-2.0",
          },
        }}
      />
    </div>
  );
}
