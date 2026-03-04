"use client"

import { useCallback, useState, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Upload, File, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"

interface DocumentUploadProps {
  loanId: string
  onUploadComplete?: () => void
}

export function DocumentUpload({ loanId, onUploadComplete }: DocumentUploadProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const t = useTranslations("Documents")

  useEffect(() => {
    fetchDocuments()
  }, [loanId, user])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user || acceptedFiles.length === 0) return

    setLoading(true)

    for (const file of acceptedFiles) {
      const fileExt = file.name.split(".").pop()
      const fileName = `${loanId}/${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const uploadResult = await supabase.storage
        .from("loan-documents")
        .upload(filePath, file)

      if (uploadResult.error) {
        toast.error(`Failed to upload ${file.name}: ${uploadResult.error.message}`)
      } else {
        const urlResult = supabase.storage
          .from("loan-documents")
          .getPublicUrl(filePath)

        const publicUrl = urlResult.data.publicUrl

        const dbResult = await supabase.from("documents").insert({
          loan_id: loanId,
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_url: publicUrl,
          file_size: file.size,
        })

        if (dbResult.error) {
          toast.error("Failed to save document record")
        } else {
          toast.success(`Uploaded ${file.name}`)
        }
      }
    }

    setLoading(false)
    if (onUploadComplete) {
      onUploadComplete()
    }
    fetchDocuments()
  }, [user, loanId, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    maxFiles: 5,
  })

  const fetchDocuments = async () => {
    if (!user) return

    const result = await supabase
      .from("documents")
      .select("*")
      .eq("loan_id", loanId)
      .eq("user_id", user.id)

    if (result.data) {
      setDocuments(result.data)
    }
  }

  const deleteDocument = async (docId: string, filePath: string) => {
    const result = await supabase.storage
      .from("loan-documents")
      .remove([filePath])

    if (result.error) {
      toast.error("Failed to delete file")
      return
    }

    await supabase.from("documents").delete().eq("id", docId)
    toast.success("Document deleted")
    fetchDocuments()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            {isDragActive
              ? t("dropFiles")
              : t("dragDrop")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("fileFormats")}
          </p>
        </div>

        {documents.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t("uploadedDocuments")}</h4>
            {documents.map((doc: any) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div className="flex items-center gap-3">
                  <File className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(doc.file_size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(doc.file_url, "_blank")}
                  >
                    {t("view")}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteDocument(doc.id, doc.file_path)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}